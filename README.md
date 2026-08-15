# KairosGeist Website

Static site for kairosgeist.de. No backend, plain HTML/CSS — the only
"build step" is generating pages from templates so no personal contact
info ever needs to live in git (see **Configuring your own copy** below).

German is the default language (served at the domain root); English lives
under `/en/`. Pages, in both languages:

- `index.html` — Home
- `product.html` — Product
- `roadmap.html` — Roadmap
- `team.html` — Team
- `careers.html` / `apply.html` — Careers listing + application form (optional, see below)
- `contact.html` — Contact

## Structure

The deployable pages at the repo root (and under `en/`) are **generated,
not hand-edited** — they're built from `templates/` + `config.sh`. To
change page content, edit the matching file under `templates/`, then run
`./scripts/build.sh` to regenerate.

Each page is self-contained (inline CSS, no JS framework, no shared
components). A top nav bar (logo + page links + language switcher) is
repeated on every page. Fonts load from Google Fonts. The Contact form
submits to Formspree via `fetch` (no page navigation — it shows an inline
success/error message and resets the form). The Careers apply form works
the same way, but posts to a Cloudflare Worker (`_careers-worker/`) that
emails the CV/cover letter as attachments and sends the applicant a
confirmation — see **Careers page** below.

## Configuring your own copy

Every KairosGeist-specific contact address, form ID, and endpoint URL is
a placeholder token in `templates/` (things like `__TEAM_EMAIL__`). Real
values live in `config.sh`, which is gitignored — your values never get
committed.

```
cp config.example.sh config.sh
```

Fill in `config.sh` with your own `TEAM_EMAIL`, `FOUNDER_EMAIL`,
`FORMSPREE_ID`, `WORKER_URL`, and `CORS_ORIGIN` (see comments in
`config.example.sh` for what each one is), then run:

```
./scripts/build.sh
```

This regenerates every page at the repo root and `en/`, plus
`_careers-worker/src/index.ts`, with your values filled in. Review the
diff (`git diff`) and commit as usual.

## Branding

The config system above only covers *functional* values (emails, form
IDs, URLs) — it does not, and can't, generate someone else's brand for
them. Before publishing your own copy, replace by hand:

- **Logo**: an inline SVG (not an image file) repeated in the nav bar and
  hero header of every template under `templates/`. Search for
  `<svg width="26" height="26" viewBox="0 0 200 200">` (nav) and
  `<svg class="logo-icon"` (hero) and swap in your own mark.
- **Team photos**: `assets/team-vishnu.jpg` and `assets/team-vincy.jpg`,
  referenced from `templates/team.html` / `templates/en/team.html`.
  Replace the files (or repoint the `<img>` tags) with your own team's
  photos.
- **All written content** — product description, roadmap, team bios, job
  postings — is specific to KairosGeist and needs rewriting for your own
  company; nothing here attempts to genericize prose.

## Careers page (optional)

The Careers/Apply flow needs more than static hosting: a Cloudflare
Worker (`_careers-worker/`) that emails applications via
[Resend](https://resend.com), which in turn requires **owning a domain**
so you can add the DNS records Resend needs to verify you as a sender.
If you don't have a domain, or don't want to set up Cloudflare + Resend,
skip this feature entirely:

1. Delete `careers.html`, `apply.html`, `en/careers.html`, `en/apply.html`
   and their counterparts under `templates/`.
2. Delete `_careers-worker/` and `templates/_careers-worker/`.
3. Remove the "Careers" / "Karriere" nav link from the remaining
   templates (search for `careers.html` under `templates/`).
4. Leave `WORKER_URL` and `CORS_ORIGIN` blank in `config.sh` — they're
   unused once step 1–2 are done.

If you *are* setting it up: sign up at [resend.com](https://resend.com),
verify your domain there (add the DNS records they give you), create an
API key, then from `_careers-worker/`:

```
npm install
npx wrangler login
npx wrangler deploy
npx wrangler secret put RESEND_API_KEY   # paste your Resend key when prompted
```

Set `WORKER_URL` in `config.sh` to the URL `wrangler deploy` prints, and
`CORS_ORIGIN` to whatever origin your site is actually served from, then
rerun `./scripts/build.sh`.

## Local preview

Just open any generated `.html` file directly in a browser — no server
required.

## Deploying

1. **Formspree**: sign up at [formspree.io](https://formspree.io), create
   a form, and put its ID in `config.sh` (`FORMSPREE_ID`), then rerun
   `./scripts/build.sh`.
2. **GitHub Pages** — pick one:

   **With a custom domain** (what kairosgeist.de uses):
   - Push this repo to GitHub, any repo name
   - In Settings → Pages, set the source branch (usually `main`) and save
   - Under Settings → Pages → Custom domain, enter your domain
   - At your registrar, add:
     - Four `A` records for `@` pointing to GitHub Pages' IPs:
       `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     - A `CNAME` record for `www` pointing to `<your-github-username>.github.io`
     - DNS propagation can take a few hours
   - Once DNS resolves, enable **Enforce HTTPS** in Settings → Pages
   - Set `CORS_ORIGIN` in `config.sh` to `https://yourdomain.com`

   **Without a custom domain**: every link on this site is root-absolute
   (`/product.html`, `/assets/...`), so it only works unmodified if it's
   served from the *true root* of a domain — not from a subpath like
   `username.github.io/repo-name/`, where those links would 404. The fix
   is to name the repo exactly `<your-github-username>.github.io` — GitHub
   then serves it at `https://<your-github-username>.github.io/` with no
   subpath, and everything resolves correctly with zero DNS setup. Set
   `CORS_ORIGIN` in `config.sh` to that URL.
