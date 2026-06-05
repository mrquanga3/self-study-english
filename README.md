# English Pronunciation Audio Generator

**🔊 Live site: https://mrquanga3.github.io/self-study-english/**

Generates American-English **connected-speech / reduction** practice audio using
Microsoft Edge's online neural voices (free, no API key). Each "set" is a short
script that turns a list of words/sentences into an `.mp3` for a female and a
male voice.

## Requirements

- [Node.js](https://nodejs.org/) 18+ (uses ES modules + top-level `await`)
- Internet connection (the voices are synthesized online)

## Install

```bash
npm install
```

## Usage

**Build everything** (all sets, both voices):

```bash
npm run build
```

**Build one set** — run its script directly:

```bash
node nt-drop.js
node palatalization.js
# ...etc
```

Output goes to `audio/<set>/female.mp3` and `audio/<set>/male.mp3`, plus a
combined `audio/combined/{female,male}.mp3` containing every part in order.

## Web page

`index.html` is a static page that plays every set (and the full course) in the
browser. It's published via GitHub Pages at the link above.

To (re)enable Pages: repo **Settings → Pages → Source: Deploy from a branch →
`main` → `/ (root)` → Save**. The site is live a minute later.

## The sets

| Set | Script | Feature | Example |
|---|---|---|---|
| reductions | `reduce.js` | casual contractions | wanna, gonna, gotta |
| word-reductions | `word-reductions.js` | weak function words | to→tuh, for→fer, and→en |
| contractions | `contractions.js` | 've / 'll minimal pairs | I / I've / I'll |
| flap-t | `flap-t.js` | T between vowels → D | water → "wadder" |
| glottal-t | `glottal-t.js` | T before syllabic N | button → "buh-'n" |
| nt-drop | `nt-drop.js` | T drops after N | internet → "innernet" |
| linking | `linking.js` | words glue together | pick it up → "pi-ki-tup" |
| palatalization | `palatalization.js` | D/T + Y blend | did you → "didja" |
| minimal-pairs | `minimal-pairs.js` | similar-sounding words | world / word / would |
| it-acronyms | `it-acronyms.js` | how tech terms are said | XML → ex-em-el, JSON → jay-son |

## Customizing

- **Change the words/sentences:** edit the `sentences` / `words` / `groups`
  array near the top of any set's script, then re-run it.
- **Change the voices:** edit the `jobs` (or `VOICES`) array in the script.
  The casual voices `en-US-AvaNeural` (female) and `en-US-AndrewNeural` (male)
  are used because they actually perform the reductions — see CLAUDE.md.
- **Add a new set:** copy an existing script, change `OUT_DIR` and the content,
  then add the filename to the `scripts` array in `all.js`.

## Notes / limitations

- **Reductions need sentence context.** A word said alone is pronounced in its
  full, careful form even by a casual voice. Most sets embed each target word in
  a natural sentence so the reduction actually happens.
- **Some reductions Edge can't do.** The free Edge voices won't drop the T in
  the `-tain` family (mountain, certain, curtain) and won't render a true
  glottal stop on demand. The IPA/`<phoneme>` tag that could force it is
  rejected by the free endpoint. Those words are kept for reference but will
  have an audible T. A phoneme-capable TTS (e.g. Azure Speech) would be needed
  for accurate audio there.
