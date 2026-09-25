#!/usr/bin/env python3
"""Catalog event media: dimensions, capture time and timezone, video duration and
rotation, and Live Photo pairs. Uses only macOS tools (sips, mdls) and ffprobe.

Usage: inventory.py <media-dir> <out.json>
"""
import json, os, re, subprocess, sys
from datetime import datetime

media, out = sys.argv[1], sys.argv[2]
sh = lambda *a: subprocess.run(a, capture_output=True, text=True).stdout
files = sorted(f for f in os.listdir(media) if not f.startswith("."))
bases = {}
for f in files:
    bases.setdefault(os.path.splitext(f)[0], []).append(f)

rows = []
for f in files:
    p = os.path.join(media, f)
    ext = os.path.splitext(f)[1].upper()[1:]
    r = dict(file=f, type=ext, bytes=os.path.getsize(p), captured_at="", timezone="unknown", duration_s="")
    if ext in ("HEIC", "JPG", "JPEG", "PNG"):
        s = sh("sips", "-g", "pixelWidth", "-g", "pixelHeight", "-g", "creation", "-g", "orientation", p)
        g = lambda k: (re.search(rf"{k}: (.*)", s) or [None, ""])[1].strip()
        r.update(width=g("pixelWidth"), height=g("pixelHeight"), orientation=g("orientation"))
        local = g("creation")
        utc = sh("mdls", "-raw", "-name", "kMDItemContentCreationDate", p).strip()
        if local and utc and utc != "(null)":
            lt = datetime.strptime(local, "%Y:%m:%d %H:%M:%S")
            ut = datetime.strptime(utc, "%Y-%m-%d %H:%M:%S %z").replace(tzinfo=None)
            off = round((lt - ut).total_seconds() / 3600)
            # Copied files get a new Spotlight date; an impossible offset means that.
            r["timezone"] = f"UTC{off:+d}" if -12 <= off <= 14 else "unknown (file was copied?)"
            r["captured_at"] = lt.strftime("%Y-%m-%dT%H:%M:%S")
    else:
        j = json.loads(sh("ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", p) or "{}")
        if not j.get("streams"):
            rows.append(r)
            continue
        tags = j["format"].get("tags", {})
        v = next(s for s in j["streams"] if s.get("codec_type") == "video")
        w, h, rot = v.get("width"), v.get("height"), 0
        for sd in v.get("side_data_list", []) or []:
            rot = int(sd.get("rotation", rot))
        if abs(rot) == 90:
            w, h = h, w
        r.update(width=w, height=h, orientation=f"rot{rot}", duration_s=round(float(j["format"]["duration"]), 1))
        cd = tags.get("com.apple.quicktime.creationdate", "")
        if cd:
            r["captured_at"] = cd[:19]
            r["timezone"] = "UTC" + cd[19:22].replace("+0", "+").replace("-0", "-")
        r["live_photo_tag"] = tags.get("com.apple.quicktime.live-photo.auto", "")
    rows.append(r)

by_name = {r["file"]: r for r in rows}
for r in rows:
    sib = [x for x in bases[os.path.splitext(r["file"])[0]] if x != r["file"]]
    r["live_photo_pair"] = ""
    if sib:
        o = by_name[sib[0]]
        video = r if r["type"] in ("MP4", "MOV") else o
        same_minute = r["captured_at"][:16] == o["captured_at"][:16]
        short = float(video["duration_s"] or 99) < 4
        r["live_photo_pair"] = f"{sib[0]} ({'confirmed' if same_minute and short else 'NOT confirmed'})"

with open(out, "w") as fh:
    json.dump(rows, fh, indent=1, ensure_ascii=False)
print(f"{len(rows)} files -> {out}")
