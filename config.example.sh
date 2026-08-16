# Copy this file to config.sh and fill in your own values:
#   cp config.example.sh config.sh
#
# config.sh is gitignored — it never gets committed, so your real values
# never end up in git history. Run ./scripts/build.sh after editing it
# (and again any time you change it) to regenerate the deployable pages.

# Shown in every page's footer as a mailto link.
TEAM_EMAIL="team@yourdomain.com"

# From your Formspree form's endpoint: https://formspree.io/f/YOUR_ID
FORMSPREE_ID="your_formspree_form_id"

# Base URL of your deployed careers Worker, no trailing slash.
# Only needed if you're keeping the Careers/Apply pages — see README.
WORKER_URL="https://your-worker.your-subdomain.workers.dev"

# The origin your site is actually served from — must match exactly
# (including https://, no trailing slash). Used by the Worker's CORS check.
CORS_ORIGIN="https://yourdomain.com"

# Optional — powers the /feedback/ pain-point survey. Leave unset (or as
# '{}') and the page still builds, but shows "not configured" instead of
# submitting. See README.md's "Feedback page" section for how to build the
# 3 Google Forms and generate this JSON value.
FEEDBACK_FORM_CONFIG_JSON='{}'
