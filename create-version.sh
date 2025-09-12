#!/bin/bash

# Automated version creation script
# Usage: ./create-version.sh "Description of changes"

if [ $# -eq 0 ]; then
    echo "Usage: ./create-version.sh 'Description of changes'"
    echo "Example: ./create-version.sh 'Fixed mortgage type handling'"
    exit 1
fi

# Get the highest version number
HIGHEST_VERSION=$(git tag -l | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | sort -V | tail -1)

if [ -z "$HIGHEST_VERSION" ]; then
    NEW_VERSION="v1.0.0"
else
    # Extract the patch number and increment it
    PATCH_NUMBER=$(echo $HIGHEST_VERSION | sed 's/v[0-9]*\.[0-9]*\.//')
    NEW_PATCH=$((PATCH_NUMBER + 1))
    NEW_VERSION="v1.0.$NEW_PATCH"
fi

echo "Creating version: $NEW_VERSION"
echo "Description: $1"

# Create and push the tag
git tag -a "$NEW_VERSION" -m "$1"
git push origin "$NEW_VERSION"

echo "✅ Git tag $NEW_VERSION created and pushed!"

# If GitHub CLI is available and authenticated, create a Release for this tag
if command -v gh >/dev/null 2>&1; then
    echo "🛠  Creating GitHub Release for $NEW_VERSION via gh..."
    if gh auth status >/dev/null 2>&1; then
        gh release create "$NEW_VERSION" -t "$NEW_VERSION" -n "$1" >/dev/null 2>&1 && \
        echo "🎉 GitHub Release created: https://github.com/bonushomes/website-webflow-code/releases/tag/$NEW_VERSION" || \
        echo "⚠️  Failed to create GitHub Release via gh. You can create it manually in the UI."
    else
        echo "⚠️  gh is installed but not authenticated. Run: gh auth login"
        echo "👉 Tag is available here: https://github.com/bonushomes/website-webflow-code/tree/$NEW_VERSION"
    fi
else
    echo "ℹ️  GitHub Release not auto-created (gh not found)."
    echo "👉 Tag is available here: https://github.com/bonushomes/website-webflow-code/tree/$NEW_VERSION"
    echo "👉 To create a Release manually: gh release create $NEW_VERSION -t '$NEW_VERSION' -n '$1'"
fi
