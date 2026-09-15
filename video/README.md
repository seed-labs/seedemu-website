# Demo videos

Keep the demo videos in this `video` directory. Each player uses a WebM version
first and retains the original MP4 as a fallback:

1. `build-and-run.webm` and `build-and-run.mp4`
2. `3000-2.webm` and `3000-2.mp4`

Preview the site through Jekyll from the project root and open the served homepage.

The WebM versions use VP9 video (plus Opus audio where the original has audio).
The original MP4 recordings are retained at their original resolution. The shared
player lives in `_includes/components/video.html`; it loads video only on demand.

The network demo poster is extracted from the original footage. The build demo
uses an English SVG cover. When replacing footage, update both source formats
and the relevant poster.
