#!/bin/bash
# Contact sheets for reviewing event media quickly: 20 photos per sheet (5x4) and
# 3 frames per video (10%, 50%, 90%), each labeled with its file name.
# Usage: contact-sheets.sh <media-dir> <out-dir>
set -euo pipefail
MEDIA=$1; OUT=$2
FONT=/System/Library/Fonts/Supplemental/Arial.ttf
TMP=$(mktemp -d); mkdir -p "$OUT" "$TMP/photos" "$TMP/videos"
VF="scale=640:480:force_original_aspect_ratio=decrease,pad=640:480:(ow-iw)/2:(oh-ih)/2:color=gray"
label() { echo "drawtext=fontfile=$FONT:text='$1':x=8:y=8:fontsize=30:fontcolor=$2:box=1:boxcolor=black@0.7"; }

i=0
find "$MEDIA" -maxdepth 1 -type f \( -iname '*.heic' -o -iname '*.jpg' -o -iname '*.jpeg' \) | sort | while read -r f; do
  b=$(basename "${f%.*}"); n=$(printf %03d $i)
  sips -s format jpeg "$f" --out "$TMP/$b.jpg" >/dev/null
  ffmpeg -v error -y -i "$TMP/$b.jpg" -vf "$VF,$(label "$b" yellow)" "$TMP/photos/$n.png"
  i=$((i+1))
done

j=0
find "$MEDIA" -maxdepth 1 -type f \( -iname '*.mov' -o -iname '*.mp4' \) | sort | while read -r f; do
  b=$(basename "${f%.*}")
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  for p in 10 50 90; do
    t=$(python3 -c "print($d*$p/100)")
    ffmpeg -v error -y -ss "$t" -i "$f" -frames:v 1 -vf "$VF,$(label "$b t$p" cyan)" "$TMP/videos/$(printf %03d $j).png"
    j=$((j+1))
  done
done

ls "$TMP/photos"/*.png >/dev/null 2>&1 && ffmpeg -v error -y -framerate 1 -i "$TMP/photos/%03d.png" -vf tile=5x4:padding=6:color=black -q:v 3 "$OUT/photos_%d.jpg"
ls "$TMP/videos"/*.png >/dev/null 2>&1 && ffmpeg -v error -y -framerate 1 -i "$TMP/videos/%03d.png" -vf tile=3x6:padding=6:color=black -q:v 3 "$OUT/videos_%d.jpg"
rm -rf "$TMP"
ls "$OUT"
