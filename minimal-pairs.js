import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

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
];

// Build: "GROUP. World, world. The whole world... Word, word. ..."
const sentences = groups.flatMap((g) =>
  g.items.flatMap((it) => [it.say, it.sentence])
);

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is minimal pairs. These are similar words with one different sound. Listen carefully. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

// Casual American voices.
const jobs = [
  { voice: "en-US-AvaNeural", file: "female.mp3" },
  { voice: "en-US-AndrewNeural", file: "male.mp3" },
];

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
