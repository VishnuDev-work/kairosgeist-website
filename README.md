# KairosGeist Website

Static site for kairosgeist.de. No backend, plain HTML/CSS — the only
"build step" is generating pages from templates so no personal contact
info ever needs to live in git (see **Configuring your own copy** below).

German is the default language (served at the domain root); English lives
under `/en/`. URLs are clean (no `.html`) — each page lives at
`<slug>/index.html`, e.g. `/product/` not `/product.html`. Pages, in both
languages:

- `/` — Home
- `/product/` — Product
- `/roadmap/` — Roadmap
- `/team/` — Team
- `/careers/` / `/apply/` — Careers listing + application form (optional, see below)
- `/contact/` — Contact
- `/feedback/` — role-branching pain-point survey (optional, see below)

Every old `/page.html` URL still resolves — it's a tiny redirect stub
(`<meta refresh>` + JS) pointing at the clean URL, so old links, bookmarks,
and shares keep working.

## Getting started

If you just cloned or pulled this repo, here's the fastest path to a
working local copy:

```
git clone <this-repo-url>
cd kairosgeist-website
cp config.example.sh config.sh   # fill in your own values, see "Configuring your own copy" below
./scripts/build.sh                # generates the deployable pages from templates/
python3 -m http.server 8000       # then visit http://localhost:8000/
```

Everything you'd actually edit lives under `templates/` — see **Structure**
below before changing anything, since the root-level `*.html` files are
generated output, not the source.

## Working with Git

If you're new to Git, the official docs are the best starting point:
[git-scm.com/doc](https://git-scm.com/doc) (or GitHub's own walkthrough at
[docs.github.com/get-started/using-git](https://docs.github.com/en/get-started/using-git)) —
this README won't re-teach it. The short version for this repo: edit files
under `templates/`, run `./scripts/build.sh`, then `git add`, `git commit`,
`git push` as usual. `config.sh` is gitignored on purpose (see below) —
never force-add it.

## Structure

The deployable pages at the repo root (and under `en/`) are **generated,
not hand-edited** — they're built from `templates/` + `config.sh`. Real
content lives at `templates/<slug>/index.html` (e.g. `templates/product/index.html`);
the flat `templates/<slug>.html` files are just the redirect stubs. To
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

Fill in `config.sh` with your own `TEAM_EMAIL`, `FORMSPREE_ID`,
`WORKER_URL`, and `CORS_ORIGIN` (see comments in `config.example.sh` for
what each one is), then run:

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
  referenced from `templates/team/index.html` / `templates/en/team/index.html`.
  Replace the files (or repoint the `<img>` tags) with your own team's
  photos.
- **Favicon**: `assets/favicon.svg` — currently the same mark as the nav
  logo, in the brand teal. Swap it for your own icon.
- **Product page laptop mockup**: the Product page (`templates/product/index.html`,
  `.laptop-mockup` block) crossfades through 4 screenshots inside a laptop
  frame, one every 4 seconds — `assets/product-mockup-1.png` through
  `-4.png`. These are also reused as the `og:image` social-preview image
  (currently `-1.png`) on every page. Each one is a **complete,
  pre-composited image** — the screenshot is already merged into the
  laptop chrome, not layered on top of it with CSS. To make your own:
  1. Take (or design) your product screenshot.
  2. Composite it into `assets/laptop-chrome.png` — a 7013×4093 PNG with
     a transparent cutout for the screen area (roughly the region from
     5% from the left/top to 95%/88% of the image, i.e. pixel box
     `(354, 307, 6659, 3612)` — measure `assets/laptop-chrome.png`'s own
     alpha channel to confirm, since this may shift if you replace the
     chrome art). Resize your screenshot to fill that box without
     stretching (crop or letterbox, whichever loses less), then
     alpha-composite the chrome on top so its opaque bezel covers
     everything outside the cutout. A short PIL script is the
     straightforward way to do this:
     ```python
     from PIL import Image
     chrome = Image.open("assets/laptop-chrome.png").convert("RGBA")
     shot = Image.open("your-screenshot.png").convert("RGBA")
     cutout_box = (354, 307, 6659, 3612)  # (left, top, right, bottom)
     w, h = cutout_box[2] - cutout_box[0], cutout_box[3] - cutout_box[1]
     shot_fit = shot.resize((w, h))  # or crop-to-fit if aspect ratios differ
     canvas = Image.new("RGBA", chrome.size, (0, 0, 0, 0))
     canvas.paste(shot_fit, cutout_box[:2])
     composited = Image.alpha_composite(canvas, chrome)
     composited.resize((1600, 934)).convert("RGB").save("assets/product-mockup-1.png")
     ```
  3. Do this for each of the 4 slides, then open the Product page locally
     and check the crossfade visually — small misalignments are much
     easier to catch by eye than to compute.
  This baked-image approach exists because an earlier version tried
  layering a live screenshot over a static chrome PNG with CSS
  positioning, and the percentage-based alignment never fully converged
  across browsers — baking them together once with PIL sidesteps that
  entirely. `assets/product-shot-*.png` are the raw, uncomposited
  screenshots this repo's own mockups were built from — reference only,
  not used by any page directly; safe to delete once you've made your own.
- **Social preview image**: every page's `og:image` (see `<head>` in each
  template) points at `assets/product-mockup-1.png` — covered above, since
  it's the same file as slide 1 of the laptop mockup.
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

1. Delete the `careers/` and `apply/` directories (and `en/careers/`,
   `en/apply/`) plus their `templates/careers/`, `templates/apply/`
   counterparts and the `templates/careers.html` / `templates/apply.html`
   redirect stubs (and `en/` equivalents).
2. Delete `_careers-worker/` and `templates/_careers-worker/`.
3. Remove the "Careers" / "Karriere" nav link from the remaining
   templates (search for `/careers/` under `templates/`).
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

## Feedback page (optional)

`/feedback/` is a role-branching pain-point survey (Owner/GM, Supervisor,
Staff — each sees a different, relevant set of Likert-scale questions).
It's linked from the Product page's "Have a specific pain point?" box,
opens in a new tab, and closes itself a few seconds after submitting.

**Why Google Forms as the backend:** free, zero setup, and responses land
in a ready-to-analyze Sheet. The page itself is fully custom (your
branding, your questions, auto-close on submit) — visitors never see the
actual Google Form.

**Submission goes through the Careers Worker (`_careers-worker/`), not
straight to Google.** An earlier version posted directly from the browser
to Google Forms' `formResponse` endpoint via a hidden iframe (to sidestep
Google not sending CORS headers) — but that made the submission a pure
fire-and-forget: the page showed "Thank you" unconditionally, with no way
to detect an ad blocker, tracker-blocking extension, or network hiccup
silently swallowing the request before it reached Google. Real responses
went missing with zero indication anything had failed. Now the page POSTs
JSON to `${WORKER_URL}/feedback`, the Worker forwards it to Google
**server-side** (where the response is actually readable — CORS only
restricts browsers, not server-to-server requests) and simultaneously
emails a backup copy to the team inbox via Resend. The "Thank you" screen
only shows if the Worker confirms at least one of those two channels
succeeded; otherwise the page shows a real error and lets the visitor
retry. This means **the Feedback page now requires the Careers Worker to
be deployed**, even if you don't want the Careers/Apply pages themselves
— see **Careers page** below for Worker setup, and set `WORKER_URL` in
`config.sh` either way.

**If you don't want this feature**, leave `FEEDBACK_FORM_CONFIG_JSON`
unset in `config.sh` (or set it to `'{}'`, same as the example file) — the
page still builds and the link still shows, but submitting shows a
"survey not configured" error instead of silently failing. To remove it
entirely: delete `feedback/` and `en/feedback/` plus their
`templates/feedback/`, `templates/en/feedback/` counterparts, and remove
the "pain-box" link (search for `/feedback/` under `templates/`).

**If you do want it, set it up like this:**

1. Create 3 separate Google Forms — one each for Owner/GM, Supervisor, and
   Staff — with whatever questions fit your business. (The live
   KairosGeist version uses a 1–5 Likert scale per statement plus a
   couple of multiple-choice context questions; adapt freely.) Turn off
   "Collect email addresses" so responses stay anonymous.
2. You only need **one language** of each form — it's a pure data
   backend, never shown to visitors. Both the German and English
   `/feedback/` pages can submit to the same 3 forms.
3. Get each question's field ID (`entry.XXXXXXX`). Two ways to do this:
   - **Manual**: open the form, fill it out once, use the "⋮" menu →
     "Get pre-filled link", and read the `entry.XXXXXXX=value` pairs out
     of the generated URL's query string — one per question, in order.
   - **Faster, if you have a coding agent handy**: fetch the form's
     `viewform` HTML (`curl -sL <form-url>`) and look for a
     `FB_PUBLIC_LOAD_DATA_ = [...]` assignment in the page source — it's
     a JSON array containing every question's text and field ID, so you
     can parse it directly instead of manually testing pre-filled links.
4. Build one JSON value shaped like this (this is what
   `FEEDBACK_FORM_CONFIG_JSON` holds):

   ```json
   {
     "owner": {
       "action": "https://docs.google.com/forms/d/e/<FORM_ID>/formResponse",
       "entries": { "q1": "entry.123", "q2": "entry.456", "...": "..." }
     },
     "supervisor": { "action": "...", "entries": { "...": "..." } },
     "worker": { "action": "...", "entries": { "...": "..." } }
   }
   ```

   The keys inside `entries` (`q1`, `q2`, etc.) must match the `name`
   attributes on the `<select>`/radio inputs in
   `templates/feedback/index.html` — if you change the questions, keep
   the field names and the entries object in sync.
5. Add it to `config.sh` as a single-quoted, single-line JSON string:

   ```
   FEEDBACK_FORM_CONFIG_JSON='{"owner":{"action":"...","entries":{...}},"supervisor":{...},"worker":{...}}'
   ```

6. Run `./scripts/build.sh`, **then redeploy the Worker**
   (`npx wrangler deploy` from `_careers-worker/`) — `FEEDBACK_FORM_CONFIG_JSON`
   now gets baked into the Worker's source (`_careers-worker/src/index.ts`),
   not just the page, so a build without a redeploy leaves the live Worker
   on the old config. Never paste real form IDs directly into
   `templates/feedback/index.html` or `templates/_careers-worker/src/index.ts`
   — they belong in `config.sh` only, same as every other secret in this
   repo, so a fork doesn't inherit your live forms.

`/feedback/` carries a `noindex` meta tag on purpose — it's meant to be
reached only via the direct link or a printed/QR code, never discovered
through search or site navigation.

## Local preview

Clean URLs need directory-index resolution, which a bare double-click
(`file://`) won't do. Run a local server from the repo root instead:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000/`.

## Deploying

1. **Formspree**: sign up at [formspree.io](https://formspree.io), create
   a form, and put its ID in `config.sh` (`FORMSPREE_ID`), then rerun
   `./scripts/build.sh`.
2. **GitHub Pages** — pick one:

   **With a custom domain** (what kairosgeist.de uses):
   - **Edit the `CNAME` file at the repo root first** — it's a plain text
     file containing just `kairosgeist.de`, and GitHub Pages reads it to
     set the custom domain automatically. Replace its contents with your
     own domain before pushing, or Pages will try to serve your fork
     under a domain you don't own and the deployment will silently fail
     to work as expected. (It's a plain committed file, not gitignored or
     templated — there was never a need to keep it out of git the way
     `config.sh` is, since a domain name isn't a secret, but it does need
     to be *yours*, not left as `kairosgeist.de`.)
   - Push this repo to GitHub, any repo name
   - In Settings → Pages, set the source branch (usually `main`) and save
   - Under Settings → Pages → Custom domain, enter your domain (should
     already show what's in `CNAME`, confirming it took)
   - At your registrar, add:
     - Four `A` records for `@` pointing to GitHub Pages' IPs:
       `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     - A `CNAME` record for `www` pointing to `<your-github-username>.github.io`
     - DNS propagation can take a few hours
   - Once DNS resolves, enable **Enforce HTTPS** in Settings → Pages
   - Set `CORS_ORIGIN` in `config.sh` to `https://yourdomain.com`

   **Without a custom domain**: every link on this site is root-absolute
   (`/product/`, `/assets/...`), so it only works unmodified if it's
   served from the *true root* of a domain — not from a subpath like
   `username.github.io/repo-name/`, where those links would 404. The fix
   is to name the repo exactly `<your-github-username>.github.io` — GitHub
   then serves it at `https://<your-github-username>.github.io/` with no
   subpath, and everything resolves correctly with zero DNS setup. Set
   `CORS_ORIGIN` in `config.sh` to that URL.
