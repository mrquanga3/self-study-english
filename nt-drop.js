import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const OUT_DIR = join("audio", "nt-drop");
mkdirSync(OUT_DIR, { recursive: true });

// "nt -> n" drop: a T after N, between vowels, disappears in casual American
// English (internet -> "innernet", twenty -> "twenny").
//
// IMPORTANT: the drop only happens when the word is UNSTRESSED inside a
// sentence. Said alone (even by a casual voice) the T comes back, so we put
// each word in a natural sentence and let Ava/Andrew reduce it.
const sentences = [
  "I found it on the internet.",   // internet  -> innernet
  "Can I get an interview?",       // interview -> innerview
  "That's really interesting.",    // interesting -> inneresting
  "There were twenty of them.",    // twenty    -> twenny
  "Meet me in the center.",        // center    -> cenner
  "It's cold in the winter.",      // winter    -> winner
  "Please enter your name.",       // enter     -> enner
  "We have plenty of time.",       // plenty    -> plenny
  "The printer is broken.",        // printer   -> prinner
  "He's a really good hunter.",    // hunter    -> hunner
  "I live in the county.",         // county    -> counny
  "I have to see the dentist.",    // dentist   -> dennist
  "My grandpa is seventy.",        // seventy   -> sevenny
  "I wanted to call you.",         // wanted    -> wanned
  // IT domain
  "Connect to the internet.",      // internet  -> innernet
  "Enter your username.",          // enter     -> enner
  "The counter keeps counting.",   // counter   -> couner
  // Banking domain
  "Check the interest rate.",      // interest  -> innerest
  "I have twenty in my account.",  // twenty    -> twenny
  "Visit the banking center.",     // center    -> cenner
];

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is the N T reduction. After an N, the T often disappears. For example, internet sounds like innernet. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

// American voices.
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
