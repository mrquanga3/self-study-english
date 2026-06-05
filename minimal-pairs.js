import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "minimal-pairs");
mkdirSync(OUT_DIR, { recursive: true });

// Minimal pairs: words that sound similar but differ in one key sound.
// Each word is said twice (for clarity), then used in a short sentence.
// Add more groups to the array to extend the drill.
const groups = [
  {
    label: "world / word / would",
    items: [
      { word: "World", say: "World, world.", sentence: "The whole world is watching." }, // /wɜrld/ has L
      { word: "Word",  say: "Word, word.",   sentence: "Say every single word." },        // /wɜrd/ no L
      { word: "Would", say: "Would, would.", sentence: "I would help you." },              // /wʊd/ short oo
    ],
  },
  {
    label: "walk / work",
    items: [
      { word: "Walk", say: "Walk, walk.", sentence: "Let's go for a walk." }, // /wɔk/ "aw"
      { word: "Work", say: "Work, work.", sentence: "I have a lot of work." }, // /wɜrk/ "er"
    ],
  },
  {
    label: "thirty / dirty / thirsty",
    items: [
      { word: "Thirty",  say: "Thirty, thirty.",   sentence: "I have thirty dollars." },  // /θɜrti/ "th"
      { word: "Dirty",   say: "Dirty, dirty.",     sentence: "My shoes are dirty." },      // /dɜrti/ "d"
      { word: "Thirsty", say: "Thirsty, thirsty.", sentence: "I am really thirsty." },     // /θɜrsti/ "th + s"
    ],
  },
  {
    label: "ship / sheep",
    items: [
      { word: "Ship",  say: "Ship, ship.",   sentence: "The ship is leaving." }, // /ɪ/ short i
      { word: "Sheep", say: "Sheep, sheep.", sentence: "Count the sheep." },      // /iː/ long ee
    ],
  },
  {
    label: "full / fool",
    items: [
      { word: "Full", say: "Full, full.", sentence: "The glass is full." }, // /ʊ/ short oo
      { word: "Fool", say: "Fool, fool.", sentence: "Don't be a fool." },   // /uː/ long oo
    ],
  },
  {
    label: "bit / beat (IT)",
    items: [
      { word: "Bit",  say: "Bit, bit.",   sentence: "Flip the bit." },        // /ɪ/ short i
      { word: "Beat", say: "Beat, beat.", sentence: "Don't miss a beat." },   // /iː/ long ee
    ],
  },
  {
    label: "cache / cash (IT vs banking — homophones!)",
    items: [
      { word: "Cache", say: "Cache, cache.", sentence: "Clear the cache." }, // /kæʃ/
      { word: "Cash",  say: "Cash, cash.",   sentence: "Pay with cash." },   // /kæʃ/ — same sound!
    ],
  },
  {
    label: "bank / bang (banking)",
    items: [
      { word: "Bank", say: "Bank, bank.", sentence: "Go to the bank." },         // /k/
      { word: "Bang", say: "Bang, bang.", sentence: "The door shut with a bang." }, // /ŋ/
    ],
  },
  {
    label: "three / tree (th vs t)",
    items: [
      { word: "Three", say: "Three, three.", sentence: "I have three." }, // /θ/
      { word: "Tree",  say: "Tree, tree.",   sentence: "Climb the tree." }, // /t/
    ],
  },
  {
    label: "live / leave (short i vs long ee)",
    items: [
      { word: "Live",  say: "Live, live.",   sentence: "I live here." },  // /ɪ/
      { word: "Leave", say: "Leave, leave.", sentence: "Don't leave." },  // /iː/
    ],
  },
  {
    label: "pull / pool",
    items: [
      { word: "Pull", say: "Pull, pull.", sentence: "Pull the door." },   // /ʊ/
      { word: "Pool", say: "Pool, pool.", sentence: "Swim in the pool." }, // /uː/
    ],
  },
];

// Build: "GROUP. World, world. The whole world... Word, word. ..."
const sentences = groups.flatMap((g) =>
  g.items.flatMap((it) => [it.say, it.sentence])
);

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is minimal pairs. These are similar words with one different sound. Listen carefully. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

// Casual American voices.
// voices imported from voices.js

for (const { voice, file } of jobs) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const dest = join(OUT_DIR, file);
  const { audioStream } = tts.toStream(text);
  const out = createWriteStream(dest);

  await new Promise((resolve, reject) => {
    audioStream.pipe(out);
    audioStream.on("end", resolve);
    audioStream.on("error", reject);
    out.on("error", reject);
  });

  console.log(`Saved ${dest} (${voice})`);
}

process.exit(0);
