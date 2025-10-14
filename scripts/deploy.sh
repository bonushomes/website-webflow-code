#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required for deployment." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is required for deployment." >&2
  exit 1
fi

if git diff --quiet --ignore-submodules && git diff --cached --quiet --ignore-submodules; then
  echo "No changes detected. Nothing to deploy."
  exit 0
fi

NEXT_VERSION="$(
  node <<'NODE'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const tags = execSync('git tag --list', { stdio: ['ignore', 'pipe', 'ignore'] })
  .toString()
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);

const parts = pkg.version.split('.').map((n) => Number.parseInt(n, 10) || 0);
while (parts.length < 3) parts.push(0);

function hasTag(version) {
  const tag = `v${version}`;
  return tags.includes(tag);
}

function bumpPatch(nums) {
  const next = nums.slice();
  next[2] += 1;
  return next;
}

let candidateParts = bumpPatch(parts);
let candidateVersion = candidateParts.join('.');
while (hasTag(candidateVersion)) {
  candidateParts = bumpPatch(candidateParts);
  candidateVersion = candidateParts.join('.');
}

pkg.version = candidateVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
process.stdout.write(candidateVersion);
NODE
)"

git add -A

STAGED_FILES="$(git diff --cached --name-only)"

FILTERED_FILES="$(
  printf '%s\n' "${STAGED_FILES}" | grep -v '^RELEASE_NOTES\.md$' || true
)"

FILE_ARRAY=()
while IFS= read -r line; do
  [ -z "${line}" ] && continue
  FILE_ARRAY+=("${line}")
done <<< "${FILTERED_FILES}"

if [ "${#FILE_ARRAY[@]}" -eq 0 ]; then
  FILE_ARRAY=("Version bump only")
fi

BULLETS=""
for file in "${FILE_ARRAY[@]}"; do
  BULLETS+=" - ${file}"$'\n'
done

RELEASE_FILE="RELEASE_NOTES.md"
TODAY="$(date +%Y-%m-%d)"
SECTION_HEADER="## v${NEXT_VERSION} - ${TODAY}"

CURRENT_RELEASE_FILE="$(mktemp)"
{
  printf "%s\n\n" "${SECTION_HEADER}"
  printf "%s" "${BULLETS}"
} > "${CURRENT_RELEASE_FILE}"

TEMP_FILE="$(mktemp)"
{
  cat "${CURRENT_RELEASE_FILE}"
  printf "\n"
  if [ -f "${RELEASE_FILE}" ]; then
    cat "${RELEASE_FILE}"
  fi
} > "${TEMP_FILE}"
mv "${TEMP_FILE}" "${RELEASE_FILE}"

git add "${RELEASE_FILE}"

COMMIT_MSG="chore: release v${NEXT_VERSION}"
git commit -m "${COMMIT_MSG}"

TAG_NAME="v${NEXT_VERSION}"
TAG_MESSAGE="${SECTION_HEADER}"$'\n\n'"${BULLETS}"
git tag -a "${TAG_NAME}" -m "${TAG_MESSAGE}"

DEFAULT_REMOTE="$(git remote | head -n 1 || echo origin)"

if [ -z "${DEFAULT_REMOTE}" ]; then
  echo "Release ${TAG_NAME} created, but no git remote configured. Please push manually."
  exit 0
fi

git push "${DEFAULT_REMOTE}"
git push "${DEFAULT_REMOTE}" "${TAG_NAME}"

REMOTE_URL="$(git config --get "remote.${DEFAULT_REMOTE}.url" || true)"
REPO_SLUG=""
if [[ "${REMOTE_URL}" =~ ^git@github\.com:(.+?)(\.git)?$ ]]; then
  REPO_SLUG="${BASH_REMATCH[1]}"
elif [[ "${REMOTE_URL}" =~ ^https://github\.com/(.+?)(\.git)?$ ]]; then
  REPO_SLUG="${BASH_REMATCH[1]}"
fi

RELEASE_TITLE="v${NEXT_VERSION}"
RELEASE_BODY_FILE="${CURRENT_RELEASE_FILE}"

publish_release_with_gh() {
  if ! command -v gh >/dev/null 2>&1; then
    return 1
  fi
  gh release create "${TAG_NAME}" --title "${RELEASE_TITLE}" --notes-file "${RELEASE_BODY_FILE}" >/dev/null 2>&1
}

publish_release_with_api() {
  local token="${GITHUB_TOKEN:-${GH_TOKEN:-}}"
  if [ -z "${token}" ] || [ -z "${REPO_SLUG}" ]; then
    return 1
  fi

  RELEASE_JSON_FILE="$(mktemp)"
  TAG_NAME_OUT="${TAG_NAME}" RELEASE_TITLE_OUT="${RELEASE_TITLE}" node <<'NODE' "${RELEASE_BODY_FILE}" > "${RELEASE_JSON_FILE}"
const fs = require('fs');
const body = fs.readFileSync(process.argv[1], 'utf8');
const data = {
  tag_name: process.env.TAG_NAME_OUT,
  name: process.env.RELEASE_TITLE_OUT,
  body,
  draft: false,
  prerelease: false
};
process.stdout.write(JSON.stringify(data));
NODE

  curl -sS -X POST \
    -H "Authorization: Bearer ${token}" \
    -H "Accept: application/vnd.github+json" \
    -H "Content-Type: application/json" \
    "https://api.github.com/repos/${REPO_SLUG}/releases" \
    --data "@${RELEASE_JSON_FILE}" >/dev/null 2>&1 || return 1
}

if publish_release_with_gh || publish_release_with_api; then
  echo "Release ${TAG_NAME} created, pushed to ${DEFAULT_REMOTE}, and published on GitHub."
else
  echo "Release ${TAG_NAME} created and pushed to ${DEFAULT_REMOTE}."
  echo "Warning: Unable to auto-publish the GitHub release. Please publish manually."
fi

echo "Summary:"
printf "%s" "${BULLETS}"
