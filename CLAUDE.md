# CLAUDE.md

Guidance for Claude when working in this repo. Read this before changing the
audio generators — several rules here were learned the hard way.

## What this project is

Scripts that generate American-English **pronunciation / connected-speech**
practice audio (plus some themed sets), and publish a static web player to
GitHub Pages. Two engines:

- **Microsoft Edge** neural TTS (`msedge-tts`) — free, no key. Powers all the
  pronunciation sets in **18 voices / 9 accents**.
- **ElevenLabs** (paid key) + **local F5-TTS** (`clone_local.py`) — expressive
  game voices and voice cloning. Optional.

Live site: https://mrquanga3.github.io/self-study-english/

## Layout

- Generators (one per set), each writes `audio/<set>/<voice>.mp3`:
  `reduce.js` (reductions), `word-reductions.js`, `contractions.js`, `flap-t.js`,
  `glottal-t.js`, `nt-drop.js`, `linking.js`, `palatalization.js`,
  `minimal-pairs.js`, `it-acronyms.js`, `pilot-comms.js`, `bbc-news.js`,
  `numbers.js`, `dates.js`, `radio-tactical.js`.
- `voices.js` — **single source of truth** for voices. 18 entries
  `{ voice, file, label }` across US/British/Indian/Australian/Singapore/Thai/
  Russian/Japanese/Chinese. Files are named by accent: `us-female.mp3`,
  `gb-male.mp3`, `in-female.mp3`, … Add/remove a voice here and every set picks
  it up. (Non-`en` voices read English in their own accent — comparison only.)
- `all.js` — `npm run build`: runs every generator as a **child process** (each
  ends with `process.exit(0)`, so they can't be `import`ed in series), then
  `combine.js`, then `radio-fx.js`.
- `combine.js` — stitches each set into `audio/combined/<voice>.mp3`.
- `radio-fx.js` — ffmpeg walkie-talkie effect → `audio/pilot-radio/`,
  `audio/radio-tactical-fx/` (uses `ffmpeg-static`).
- `index.html` — static player; reads `voices.js` file names, accent dropdown
  swaps each `<audio>` `src`. Player rule: starting one pauses the others
  (simple capture listener — do NOT reintroduce the "silent-WAV unload" hack; it
  broke the controls).
- ElevenLabs/cloning: `elevenlabs-tactical.js`, `extract-audio.js`,
  `clone_local.py` + `VOICE-CLONING.md`. Output under `audio/game/`.

## Hard rules (don't regress these)

1. **Reductions need sentence context.** Words in isolation are spoken in full
   form even by casual voices. Embed targets in natural sentences. (Exception:
   `flap-t`/`glottal-t` content words survive in isolation; deletion-type sets —
   `nt-drop`, `word-reductions`, `palatalization` — do not.)
2. **Casual voices reduce; careful ones don't.** US default = Ava/Andrew. Never
   switch back to Aria/Guy for reductions (verified by ear).
3. **Never feed fake phonetic respellings to TTS** (`"pi ki tup"`, `"wadder"`) —
   it reads them literally. Use real words; let the voice produce the sound.
4. **Free Edge ignores `<phoneme>`/`<sub>`/`mstts:express-as`** (returns 0-byte
   audio). Only `voice` + `prosody` work. No forcing phonemes or shouting styles.
5. **Edge can't do `-tain` glottal/T-drop** (mountain/certain/…) or expressive
   shouting. Kept for reference with audible T. For those you need Azure (paid)
   or ElevenLabs.

## Git / privacy conventions

- **Never commit personal media.** `.gitignore` excludes `*.wav`, `*.mp3` clone
  outputs at root, `*.mp4`, `intro.txt`, `ref.txt`. (Site audio under `audio/`
  is already tracked from before; that stays.) ⚠️ Because `*.mp3` is ignored,
  **newly added site audio won't auto-stage** — `git add -f audio/<new>/` if you
  add a brand-new set.
- Commits use the noreply email (`mrquanga3@users.noreply.github.com`) — GitHub
  rejects the user's private email.

## Adding a new pronunciation set

1. Copy a generator (e.g. `palatalization.js`); set `OUT_DIR = join("audio","<name>")`.
2. Keep `import { jobs } from "./voices.js"` and the loop — do NOT hardcode voices.
3. Register in `all.js` (`scripts`) and `combine.js` (`sets`).
4. Add a card to `index.html` `sets[]` and a row to `README.md`.
5. `node <name>.js` (or `npm run build`); `git add -f audio/<name>/` if needed.
