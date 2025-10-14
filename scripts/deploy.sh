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

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const parts = pkg.version.split('.').map((n) => Number.parseInt(n, 10) || 0);
while (parts.length < 3) parts.push(0);
parts[2] += 1;

const nextVersion = parts.join('.');
pkg.version = nextVersion;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
process.stdout.write(nextVersion);
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

TEMP_FILE="$(mktemp)"
{
  printf "%s\n\n" "${SECTION_HEADER}"
  printf "%s" "${BULLETS}"
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

echo "Release ${TAG_NAME} created."
echo "Summary:"
printf "%s" "${BULLETS}"
echo
echo "Next steps:"
echo "  git push origin ${TAG_NAME}"
echo "  git push"
