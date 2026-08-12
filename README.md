# KairosGeist Website

Single-page static site for kairosgeist.de. No build step, no backend — plain HTML/CSS, one file (`index.html`).

## What's on the page

- Hero: logo, wordmark, tagline, pre-seed/EXIST-grant status
- Who we are + "System proposes. Human decides." motto
- What's actually built and working today (kept in sync with `Architecture_docs/` and `.claude/commercial_brief.md` in the main KairosGeist project — do not describe anything here that isn't real yet)
- Roadmap section, explicitly labeled "not yet available" — never blur this into the "built" section
- Founding partner program — mentions the 7-spot program exists with real terms, deliberately **without** the exact discount percentages (per the rule in `.claude/commercial_brief.md`: exact tiers stay for real conversations, not public-facing material)
- Inquiry form (via Formspree — see below)

## Before going live

1. **Formspree**: sign up free at [formspree.io](https://formspree.io), create a form, and replace `YOUR_FORM_ID` in `index.html`'s form `action` attribute with your real endpoint.
2. **GitHub Pages**:
   - Create a new GitHub repo (e.g. `kairosgeist-website`), push this project to it
   - In the repo's Settings → Pages, set the source branch (usually `main`) and save
   - Under Settings → Pages → Custom domain, enter `kairosgeist.de`
3. **Namecheap DNS**: in your Namecheap dashboard, under the domain's DNS settings, add:
   - Four `A` records pointing `@` to GitHub Pages' IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - A `CNAME` record for `www` pointing to `<your-github-username>.github.io`
   - DNS propagation can take a few hours

## Keeping content honest

Anything under "Built and working today" must stay true to what's actually shipped — check `KairosGeist/CLAUDE.md`'s "Known State" table before adding or changing a claim here. This page is public and far more exposed than an internal doc or a printed letter handed to one person — treat every sentence on it as something a prospect could screenshot and hold you to later.
