import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { jobs } from "./voices.js";

const OUT_DIR = join("audio", "word-reductions");
mkdirSync(OUT_DIR, { recursive: true });

// SINGLE WORD REDUCTIONS (function words / "weak forms").
// These only reduce when UNSTRESSED inside a sentence — said alone the voice
// uses the full form. So each word sits in a natural sentence in weak position
// and the casual voice (Ava/Andrew) reduces it. Comment shows word -> /sound/.
const sentences = [
  "I need to go now.",          // to   -> /tuh/
  "This one is for you.",       // for  -> /fer/
  "Bread and butter.",          // and  -> /en/  /n/
  "I want a cup of coffee.",    // of   -> /uh/  /əv/
  "How are you doing today?",   // you  -> /ya/  ; are -> /er/
  "What is your name?",         // your -> /yer/
  "I should have called her.",  // have -> /uv/  ; her -> /er/
  "Can you give them to me?",   // can  -> /kin/ ; them -> /em/
  "Tell him I said hi.",        // him  -> /im/
  "Is he coming with us?",      // he   -> /ee/
  "He was at the door.",        // was  -> /wuz/ ; at -> /ət/ ; the -> /thuh/
  "I am from New York.",        // from -> /frum/
  "Do you want coffee or tea?", // or   -> /er/
  "I would do it again.",       // would -> /wud/
  "Wait for a minute.",         // a    -> /uh/
  "As soon as possible.",       // as   -> /əz/
  // IT domain
  "Push the code to the server.", // to  -> /tuh/
  "This update is for the app.",  // for -> /fer/
  "Save and deploy it.",          // and -> /en/
  "Connect to the database.",     // to  -> /tuh/
  // Banking domain
  "Send the money to the bank.",  // to  -> /tuh/
  "This form is for the loan.",   // for -> /fer/
  "Deposit and withdraw.",        // and -> /en/
  "Log in to your account.",      // to  -> /tuh/
  // More common weak-form phrases (ESL references)
  "Fish and chips.",              // and -> /n/
  "A cup of tea.",                // of  -> /ə/
  "Nice to meet you.",            // to  -> /tuh/
  "Thanks for coming.",           // for -> /fer/
  "A piece of cake.",             // of  -> /ə/
  "Rock and roll.",               // and -> /n/
  "I'll see you at lunch.",       // at  -> /ət/
];

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is word reductions. Small function words like to, for, and and become short and weak. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

// Casual American voices (they actually reduce; the careful ones don't).
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
