#!/bin/bash
# Crop and export post images as WebP at 1600, 1024 and 640 px wide, with no metadata.
# HEIC goes through sips (JPEG) and ffmpeg, which applies EXIF rotation; cwebp alone
# would ignore it and portrait photos would come out sideways.
#
# Usage: derive-images.sh <media-dir> <out-dir> <list-file>
# List file, one image per line:  name source x0 x1 y0 y1
#   source = media file name without extension (e.g. IMG_8242)
#   x0 x1 y0 y1 = crop bounds as fractions of the source (0 1 0 1 = no crop)
set -euo pipefail
MEDIA=$1; OUT=$2; LIST=$3
TMP=$(mktemp -d); mkdir -p "$OUT"
while read -r name src x0 x1 y0 y1; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue;; esac
  in=$(find "$MEDIA" -maxdepth 1 -name "$src.*" | head -1)
  [ -z "$in" ] && { echo "missing: $src" >&2; continue; }
  case "${in##*.}" in HEIC|heic) sips -s format jpeg -s formatOptions 95 "$in" --out "$TMP/$src.jpg" >/dev/null; in="$TMP/$src.jpg";; esac
  ffmpeg -v error -y -i "$in" -vf "crop=iw*($x1-$x0):ih*($y1-$y0):iw*$x0:ih*$y0" "$TMP/$name.png"
  for w in 1600 1024 640; do
    suffix=$([ $w = 1600 ] && echo "" || echo "-$w")
    ffmpeg -v error -y -i "$TMP/$name.png" -vf "scale='min($w,iw)':-2" "$TMP/$name-$w.png"
    cwebp -quiet -q 78 "$TMP/$name-$w.png" -o "$OUT/$name$suffix.webp"
  done
  echo "$name"
done < "$LIST"
rm -rf "$TMP"
