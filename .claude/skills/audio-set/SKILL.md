---
name: audio-set
description: Add, extend, or regenerate a pronunciation / connected-speech audio set in this repo (Microsoft Edge TTS, 18 voices). Use when the user wants a new set, wants to add words/sentences/examples to an existing set, change voices, or rebuild the audio + web player.
---

# Audio-set skill

This repo generates American-English pronunciation practice audio with `msedge-tts`
and publishes a static player to GitHub Pages. **Read `CLAUDE.md` first** — it
holds the hard-won rules. This skill is the checklist for the common tasks.

## Key facts
- Voices live ONCE in `voices.js` (18 voices / 9 accents). Generators import
  `{ jobs }` from it; never hardcode voices.
- Each generator writes `audio/<set>/<voice>.mp3` (e.g. `us-female.mp3`).
- `npm run build` runs all generators → `combine.js` → `radio-fx.js`.
- The web player `index.html` lists sets in `sets[]`; an accent dropdown swaps
  each `<audio>` `src` between `voices.js` file names.
- `.gitignore` has `*.mp3`, so **brand-new** site audio needs `git add -f audio/<set>/`.

## Add a NEW set
1. Copy a generator (e.g. `palatalization.js`) → `<name>.js`.
2. Set `OUT_DIR = join("audio", "<name>")`; replace the `sentences`/`words` array.
3. Keep `import { jobs } from "./voices.js"` and the streaming loop unchanged.
4. Register in `all.js` (`scripts[]`) and `combine.js` (`sets[]`).
5. Add a card to `index.html` `sets[]` and a row to `README.md`.
6. `node <name>.js`; then `git add -f audio/<name>/` and commit.

## Add words/examples to an EXISTING set
1. Edit the `sentences`/`words` array in that set's `.js`.
2. **Reductions need sentence context** — don't add isolated words for
   `nt-drop`/`word-reductions`/`palatalization`; embed them in a sentence.
3. **Never use fake phonetic respellings** as input (TTS reads them literally).
4. `node <set>.js && node combine.js` to regenerate.

## Change / add a voice
- Edit `voices.js` only. Then mirror the new file name in `index.html`'s
  `voices[]`. Rebuild. (Non-`en` voices read English in their own accent.)

## Things that DON'T work on free Edge (don't retry)
- `<phoneme>` / `<sub>` / `mstts:express-as` → 0-byte audio.
- `-tain` glottal/T-drop (mountain, certain) and shouting/expressive styles.
  Those need Azure (paid) or ElevenLabs.

## Publish
`git add` the changed files (+ `-f` for new audio), commit with the noreply
email, `git push`. GitHub Pages redeploys in ~1 min.
