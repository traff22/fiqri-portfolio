"""Crop all cameo PNGs (assets/cameos/*.png) to one shared bounding box, so
every pose sits in the same frame and the loop never jumps, then save WebP and
delete the PNGs. Run after tools/render-cameos.mjs: python3 tools/crop-cameos.py"""
import glob, os
from PIL import Image
files = sorted(glob.glob("assets/cameos/*.png"))
ims = {f: Image.open(f).convert("RGBA") for f in files}
boxes = [im.getchannel("A").getbbox() for im in ims.values()]
pad = 6
box = (max(0, min(b[0] for b in boxes) - pad), max(0, min(b[1] for b in boxes) - pad),
       max(b[2] for b in boxes) + pad, max(b[3] for b in boxes) + pad)
for f, im in ims.items():
    im.crop(box).save(f[:-4] + ".webp", "WEBP", quality=88, method=6)
    os.remove(f)
print("box", box, "size", (box[2] - box[0], box[3] - box[1]))
