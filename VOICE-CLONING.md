# Local Voice Cloning Guide

Clone a voice from an audio/video sample and make it speak any text — **100% local
and free** (no API key, no cost). Uses **F5-TTS** for cloning and a tiny
**faster-whisper** model to read the reference. After the first model download
(~1.4 GB total) it runs fully offline.

> ⚠️ **Consent / legal:** only clone a voice you **own** or have explicit
> **permission** to use. Do not clone copyrighted or other people's voices.

---

## 1. Install the dependencies (one time)

You already have **Node** (for `extract-audio.js`) and **Python 3.13**. Install
the Python packages:

```bash
pip install f5-tts faster-whisper soundfile
```

`ffmpeg` is provided automatically by the project's `node_modules/ffmpeg-static`,
so you don't need a separate install.

> If `torchcodec` errors appear, ignore them — `clone_local.py` already routes
> audio through `soundfile` to avoid that Windows/Python-3.13 issue.

---

## 2. Get a voice sample

Extract a clean clip from a video or audio file (15–30 s of **one** speaker,
no music/noise):

```bash
node extract-audio.js "your video.mp4" sample.wav <startSec> <durationSec>
# example: 30 seconds starting at 0:05
node extract-audio.js "your video.mp4" sample.wav 5 30
```

This writes `sample.wav` (mono, 22.05 kHz).

---

## 3. Write what you want it to say

Copy the template and edit it:

```bash
copy intro.example.txt intro.txt    # Windows  (cp on macOS/Linux)
```

Put your text in **`intro.txt`**, or pass it on the command line with `--text`.

Tip: spell out acronyms for clearer speech (e.g. `C R M`, not `CRM`).

---

## 4. Generate

```bash
python clone_local.py
```

Options:

```bash
python clone_local.py --text "Hi, I'm Binh. Thanks for meeting me today."
python clone_local.py --sample sample.wav --output my_intro.mp3 --ref-seconds 10
```

Output: **`interview_intro.mp3`** (and a `.wav`) in the project folder.

The steps it runs: trim the sample to a short reference → transcribe it →
load F5-TTS → synthesize → convert to MP3.

---

## Notes & limits

- **Speed:** F5-TTS on **CPU is slow — roughly 20–30 minutes** per run. A GPU
  makes it seconds. Keep the text short while experimenting.
- **Reference length:** ~10–15 s of clean speech clones best (the script trims to
  `--ref-seconds`, default 12).
- **Privacy:** your sample, video, `intro.txt`, `ref*.txt` and the generated
  `interview_intro.*` are **git-ignored** — they are never committed or published.
- **First run** downloads the F5-TTS model (~1.3 GB) and a 75 MB whisper model.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ffmpeg ... FileNotFoundError` | Ensure `node_modules/ffmpeg-static` exists (`npm install`). |
| Hangs on "Download ... whisper-large" | Not used here — the script uses the tiny model. If you edited it, keep `tiny.en`. |
| `torchcodec ... DLL` error | Handled by the soundfile patch in `clone_local.py`; don't call `torchaudio.load` directly. |
| Very slow | Expected on CPU. Use a GPU machine, or shorten the text. |
