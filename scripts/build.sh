#!/usr/bin/env bash
# Generates the deployable site from templates/ + config.sh.
# Run from anywhere: ./scripts/build.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

if [ ! -f config.sh ]; then
  echo "config.sh not found." >&2
  echo "Copy the example and fill in your own values first:" >&2
  echo "  cp config.example.sh config.sh" >&2
  exit 1
fi

# shellcheck disable=SC1091
source config.sh

for var in TEAM_EMAIL FORMSPREE_ID WORKER_URL CORS_ORIGIN; do
  if [ -z "${!var:-}" ]; then
    echo "config.sh is missing a value for $var" >&2
    exit 1
  fi
done

# Feedback page (Google Forms) is optional — unlike the vars above, an unset
# value doesn't fail the build. It just renders the page in a visibly
# "not configured" state instead of silently posting to someone else's forms.
if [ -z "${FEEDBACK_FORM_CONFIG_JSON:-}" ]; then
  FEEDBACK_FORM_CONFIG_JSON='{}'
fi

# macOS ships BSD sed (needs -i ''); GNU sed takes -i directly.
sed_inplace() {
  if sed --version >/dev/null 2>&1; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

render() {
  local src="$1" dest="$2"
  mkdir -p "$(dirname "$dest")"
  cp "$src" "$dest"
  sed_inplace \
    -e "s/__TEAM_EMAIL__/${TEAM_EMAIL//\//\\/}/g" \
    -e "s/__FORMSPREE_ID__/${FORMSPREE_ID//\//\\/}/g" \
    -e "s#__WORKER_URL__#${WORKER_URL}#g" \
    -e "s#__CORS_ORIGIN__#${CORS_ORIGIN}#g" \
    -e "s#__FEEDBACK_FORM_CONFIG_JSON__#${FEEDBACK_FORM_CONFIG_JSON}#g" \
    "$dest"
}

count=0
while IFS= read -r -d '' template; do
  rel="${template#templates/}"
  render "$template" "$rel"
  count=$((count + 1))
done < <(find templates -type f -print0)

echo "Generated $count file(s) from templates/ using config.sh."
echo "Review with 'git diff' before committing."
