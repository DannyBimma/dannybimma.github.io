#!/usr/bin/env bash
#
# Builds the redirect-only site that GitHub Pages serves after the move.
#
# The old dannybimma.github.io URLs still exist in people's bookmarks, in old
# posts, and in Google's index. This generates one stub per old URL that sends
# visitors to the same page on dannybimma.blog.
#
# GitHub Pages can't issue a real 301 from a user site, so each stub uses the
# three things that do work, in order of who honours what:
#   1. <link rel="canonical">  — what search engines actually follow to move
#                                ranking signals over to the new domain.
#   2. <meta http-equiv="refresh" content="0"> — what browsers with JS off obey.
#   3. location.replace()      — instant, and replace() rather than assign()
#                                so Back doesn't bounce you into a redirect loop.
# Deliberately NOT noindex: telling crawlers to drop these pages would throw
# away the ranking signal instead of forwarding it.
#
# Usage:  ./scripts/build-redirects.sh [output-dir]     (default: _redirects_build)

set -euo pipefail

NEW_DOMAIN="https://dannybimma.blog"
OUT="${1:-_redirects_build}"

cd "$(dirname "$0")/.."

rm -rf "$OUT"
mkdir -p "$OUT"

# Write one stub. $1 is the path relative to the site root, $2 is where it goes.
emit() {
  local path="$1" target="$2"
  mkdir -p "$OUT/$(dirname "$path")"
  cat >"$OUT/$path" <<EOF
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="$target" />
  <meta http-equiv="refresh" content="0; url=$target" />
  <title>Moved to dannybimma.blog</title>
</head>

<body>
  <p>
    This site now lives at <a href="$target">$target</a>.
    Redirecting you there now&hellip;
  </p>
  <script>
    location.replace("$target");
  </script>
</body>

</html>
EOF
  echo "  $path -> $target"
}

echo "Building redirect stubs into $OUT/"

# Every page that exists on the live site gets a stub at the same path, so deep
# links land on the matching page rather than dumping everyone on the homepage.
for f in $(git ls-files '*.html'); do
  case "$f" in
    404.html)
      # The old 404 has nowhere meaningful to point; send it to the new root.
      emit "$f" "$NEW_DOMAIN/"
      ;;
    index.html)
      emit "$f" "$NEW_DOMAIN/"
      ;;
    *)
      emit "$f" "$NEW_DOMAIN/$f"
      ;;
  esac
done

# Anything not covered above (an old asset URL, a path that never existed) hits
# the Pages 404, so point that at the new site too.
emit "404.html" "$NEW_DOMAIN/"

# Stops Pages running the output through Jekyll, which would otherwise ignore
# any file or folder starting with an underscore.
touch "$OUT/.nojekyll"

# Keep the old domain out of the index now that it's pure redirect furniture,
# while still letting crawlers fetch the pages to see the canonical tags.
cat >"$OUT/robots.txt" <<EOF
User-agent: *
Allow: /

Sitemap: $NEW_DOMAIN/sitemap.xml
EOF

echo "Done. $(find "$OUT" -name '*.html' | wc -l | tr -d ' ') stubs written."
