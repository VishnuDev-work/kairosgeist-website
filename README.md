# KairosGeist Website

Static site for kairosgeist.de. No build step, no backend — plain HTML/CSS.

- `index.html` — English (served at the domain root)
- `de/index.html` — German (served at `/de/`)

## Structure

Each page is self-contained (inline CSS, no JS framework). The two language
versions link to each other via a switcher in the top-right corner. Fonts are
loaded from Google Fonts; the contact form submits via Formspree.

## Local preview

Just open `index.html` (or `de/index.html`) directly in a browser — no server
required.

## Deploying

1. **Formspree**: sign up at [formspree.io](https://formspree.io), create a
   form, and set its endpoint in the `action` attribute of the `<form>` in
   both `index.html` and `de/index.html`.
2. **GitHub Pages**:
   - Push this repo to GitHub
   - In Settings → Pages, set the source branch (usually `main`) and save
   - Under Settings → Pages → Custom domain, enter your domain
3. **DNS**: at your registrar, add:
   - Four `A` records for `@` pointing to GitHub Pages' IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - A `CNAME` record for `www` pointing to `<your-github-username>.github.io`
   - DNS propagation can take a few hours
4. Once DNS resolves, enable **Enforce HTTPS** in Settings → Pages.
