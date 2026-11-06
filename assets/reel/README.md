# Chapter One clips (your own footage, no YouTube player)

Put short excerpts of your films here and list them in `clips.json`. While the list is empty (`[]`), Chapter One keeps using the YouTube montage. As soon as it lists playable clips, Chapter One plays them as plain video: no YouTube title, logo or play button.

## Export spec (per clip)

- **Length:** 5–6 s (the reel shows each clip for 5 s). Pick a moment that reads without sound.
- **Size:** 1280×720 (16:9), 24 or 25 fps, **no audio track**.
- **Formats:** export both, so every browser has one.
  - `name.mp4`: H.264, yuv420p, `-movflags +faststart`, about 1–1.5 MB.
  - `name.webm`: VP9, about 0.8–1.2 MB. Used by Chrome, Edge, Firefox and Android.
- **Optional poster:** `name.jpg`, 1280×720, the first frame.
- Only use footage you are allowed to show publicly.

With ffmpeg, from a master file:

```bash
ffmpeg -ss 00:01:12 -t 5.5 -i master.mov -an -vf scale=1280:-2 -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart name.mp4
ffmpeg -ss 00:01:12 -t 5.5 -i master.mov -an -vf scale=1280:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 name.webm
```

## clips.json

```json
[
  {"title":"Know More Bout Me (2024)","category":"longform","youtube":"hEhRkIbH-Pg","src":"assets/reel/know-more.mp4","webm":"assets/reel/know-more.webm","poster":"assets/reel/know-more.jpg","opening":true},
  {"title":"Age of Chaos","category":"event","youtube":"c9wCgrjlUhk","src":"assets/reel/age-of-chaos.mp4","webm":"assets/reel/age-of-chaos.webm"}
]
```

- `category`: `longform`, `motion` or `event`. It lights the matching Chapter One thumbnail.
- `youtube`: the film's YouTube id. It lets the voxel monitor show it and open the project.
- `opening: true`: this clip plays first. Use it on one clip only.
- `start` (optional): the second inside the file to start from.
