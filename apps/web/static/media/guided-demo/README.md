# Guided Demo Media — Drop Files Here

This folder is where photos and video clips go for the public **Guided Demo** page:
https://tidelift.tatinc.us/guided-demo

If you're not comfortable with GitHub, don't worry — see "Easiest way to add a file" below.
There is no wrong way to try this; worst case, ask in **#hackathon-food-banks** and someone will move it.

## Where things go

- `images/` — photos and screenshots (JPG, PNG, WEBP)
- `videos/` — video clips (MP4 preferred)

## File naming

Use short, lowercase, dash-separated names so nothing breaks on the website:

```
images/dockside-sorting.jpg
images/thermal-cam-bin-01.png
videos/vessel-offload-clip.mp4
```

Avoid spaces, apostrophes, or emoji in filenames (e.g. `Dock Photo (1).HEIC` will cause problems —
rename it to `dock-photo-1.jpg` first).

## Easiest way to add a file (no GitHub experience needed)

1. Go to this folder on GitHub in your browser:
   https://github.com/kenadams1990/FoodBank-Hack/tree/main/apps/web/static/media/guided-demo
2. Click into `images` or `videos`, whichever fits your file.
3. Click the **"Add file"** button (top right) → **"Upload files"**.
4. Drag your photo/video into the browser window, or click "choose your files" to pick it from your
   computer.
5. Scroll down to the box that says **"Commit changes"**. You can leave the default message, or
   write a one-line note like "add dockside sorting photo".
6. Make sure **"Create a new branch... and start a pull request"** is selected (it usually is by
   default when you don't have write access) — then click **"Propose changes"**.
7. That's it. This opens a pull request automatically — no command line, no local setup. Post a
   quick note in **#hackathon-food-banks** so Ken knows to review it.

If you already have GitHub set up locally, a normal `git add` / `commit` / `push` works too — this
is just a real folder in the repo.

## What NOT to upload

- Nothing with faces of people who haven't agreed to be shown publicly (this repo and site are
  public).
- No screenshots containing real ACCFB internal data, personal contact info, or anything
  confidential — mock/demo data only.
- Keep video files reasonably small (a phone clip trimmed to the relevant moment, not a raw
  10-minute file) — huge files slow down the repo for everyone.

## How these show up on the site

Anything placed here is automatically served at:

```
https://tidelift.tatinc.us/media/guided-demo/images/<your-file>
https://tidelift.tatinc.us/media/guided-demo/videos/<your-file>
```

Wiring a specific image/video into the actual `/guided-demo` page layout is a code change —
drop the file here and flag it in Slack, and it'll get hooked in.
