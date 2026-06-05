# CLAUDE.md

Guidance for Claude when working in this repo. Read this before changing the
audio generators — several rules here were learned the hard way.

## What this project is

A set of small Node.js (ESM) scripts that generate American-English
pronunciation/reduction practice `.mp3` files via Microsoft Edge's free online
neural TTS (`msedge-tts`). Each script = one "set" = one folder under `audio/`.

## Layout

- `reduce.js`, `flap-t.js`, `linking.js`, `glottal-t.js`, `nt-drop.js`,
  `word-reductions.js`, `contractions.js`, `palatalization.js`,
  `minimal-pairs.js` — one generator per pronunciation feature.
- `all.js` — runs every generator as a child process (`npm run build`). Each
  generator ends with `process.exit(0)`, so they MUST be run as separate
  processes, not `import`ed in series (the first exit would kill the rest).
- `audio/<set>/female.mp3` + `male.mp3` — generated output.

Each generator follows the same shape: build a `text` string, then loop over the
shared `jobs` array (imported from `voices.js`) of `{ voice, file }`, streaming
`tts.toStream(text)` to disk.

- `voices.js` — the single source of truth for which voices/accents are produced
  (US Ava/Andrew, Indian Neerja/Prabhat, Australian Natasha/William). Add/remove
  a voice here and every set + the combiner + page picks it up. Output files are
  named by accent: `us-female.mp3`, `in-male.mp3`, `au-female.mp3`, etc.
- `index.html` reads the same file names; its accent dropdown swaps the `<audio>`
  `src` between the `voices.js` suffixes.

## Hard rules (don't regress these)

1. **Reductions need sentence context.** Words said in isolation are pronounced
   in full, careful form — even by casual voices. Earlier versions said each
   word twice in isolation (`"Internet. Internet."`) and the reduction did NOT
   happen. Embed target words in natural sentences instead. (Exceptions:
   `flap-t` and `glottal-t` content words survive in isolation; the deletion-
   type sets — `nt-drop`, `word-reductions`, `palatalization` — do not.)

2. **Use the casual voices.** `en-US-AvaNeural` (female) and
   `en-US-AndrewNeural` (male). The "careful" voices (Aria, Guy) enunciate and
   refuse most reductions. Ava/Andrew (Microsoft's conversational line) actually
   reduce. This was verified by ear by the user; do not switch back to Aria/Guy.

3. **Never use fake phonetic respellings as TTS input.** Feeding the engine
   made-up spellings like `"pi ki tup"`, `"wadder"`, or `"ki-en"` makes it read
   gibberish (it reads them literally, often with an extra vowel). Always feed
   real words/sentences and let the voice produce the sound naturally.

4. **The free Edge endpoint ignores `<phoneme>` and `<sub>` SSML.** Requests
   using them return 0-byte audio. Only `voice` and `prosody` (rate/pitch/
   volume) work. So there is NO way to force a specific phoneme (e.g. a glottal
   stop) through this service. If accurate phoneme control is ever needed, the
   path is a different TTS (Azure Speech supports `<phoneme>` + custom lexicons,
   free tier available), not more respelling tricks.

5. **Edge limitation — `-tain` words.** mountain / certain / curtain / fountain
   will NOT glottalize/drop the T on Edge regardless of voice or spelling. They
   are intentionally kept in `glottal-t.js` (grouped + commented) for reference,
   with an audible T. Don't "fix" them with respellings; it doesn't work.

## Adding a new set

1. Copy an existing generator (e.g. `palatalization.js`).
2. Change `OUT_DIR = join("audio", "<name>")` and the `sentences` content.
3. Keep `jobs` = Ava + Andrew.
4. Add the new filename to the `scripts` array in `all.js`.
5. Add a row to the table in `README.md`.

## Voice list

Available `en-US` Edge voices include: Ava, Andrew, Emma, Brian (+ their
`Multilingual` variants), Aria, Guy, Jenny, Michelle, Christopher, Eric, Roger,
Steffan, Ana. Conversational/casual = Ava, Andrew, Emma, Brian. Careful =
Aria, Guy, Jenny (avoid for reductions).
