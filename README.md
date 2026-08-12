# KairosGeist Website

Static site for kairosgeist.de. No build step, no backend — plain HTML/CSS.

German is the default language (served at the domain root); English lives
under `/en/`. Each language has four pages:

- `index.html` / `en/index.html` — Home
- `product.html` / `en/product.html` — Product
- `roadmap.html` / `en/roadmap.html` — Roadmap
- `contact.html` / `en/contact.html` — Contact

## Structure

Each page is self-contained (inline CSS, no JS framework). A top nav bar
(logo + page links + language switcher) is repeated on every page. Fonts are
loaded from Google Fonts; the contact form submits to Formspree via `fetch`
(so the page doesn't navigate away — it shows an inline success/error message
and resets the form instead). Every page also shows a brief splash screen
(rotating logo) while it loads.

## Local preview

Just open any `.html` file directly in a browser — no server required.

## Deploying

1. **Formspree**: sign up at [formspree.io](https://formspree.io), create a
   form, and set its endpoint in the `action` attribute of the `<form>` in
   both `contact.html` and `en/contact.html`.
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
