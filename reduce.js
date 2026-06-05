import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const OUT_DIR = join("audio", "reductions");
mkdirSync(OUT_DIR, { recursive: true });

// American (en-US) neural voices — change VOICE to any of these:
//   Female: en-US-AriaNeural, en-US-JennyNeural, en-US-MichelleNeural,
//           en-US-AnaNeural, en-US-AmberNeural, en-US-AshleyNeural,
//           en-US-CoraNeural, en-US-ElizabethNeural, en-US-NancyNeural,
//           en-US-SaraNeural, en-US-JaneNeural, en-US-MonicaNeural
//   Male:   en-US-GuyNeural, en-US-DavisNeural, en-US-AndrewNeural,
//           en-US-BrianNeural, en-US-JasonNeural, en-US-TonyNeural,
//           en-US-EricNeural, en-US-ChristopherNeural, en-US-RogerNeural
const VOICES = [
  { name: "en-US-AvaNeural", file: "female.mp3" },    // female (casual)
  { name: "en-US-AndrewNeural", file: "male.mp3" },   // male (casual)
];

const sentences = [
  "I wanna go home.",          // wanna  -> want to
  "Do you wanna join us?",     // wanna  -> want to
  "She’s gonna call later.",   // gonna  -> going to
  "It’s gonna rain.",          // gonna  -> going to
  "I gotta finish this today.",// gotta  -> got to / have got to
  "You gotta see this.",       // gotta  -> got to
  "I hafta leave early.",      // hafta  -> have to
  "We hafta try again.",       // hafta  -> have to
  "I’m kinda tired.",          // kinda  -> kind of
  "That’s kinda weird.",       // kinda  -> kind of
  "I sorta agree.",            // sorta  -> sort of
  "It’s sorta broken.",        // sorta  -> sort of
  "Lemme check.",              // lemme  -> let me
  "Lemme know.",               // lemme  -> let me
  "Gimme a minute.",           // gimme  -> give me
  "Gimme that book.",          // gimme  -> give me
  "I dunno what happened.",    // dunno  -> don't know
  "Dunno if it works.",        // dunno  -> don't know
  "We’re outta time.",         // outta  -> out of
  "He walked outta the room.", // outta  -> out of
  "I shoulda called.",         // shoulda -> should have
  "They coulda won.",          // coulda  -> could have
  "He woulda helped.",         // woulda  -> would have
  "I ain’t ready.",            // ain't   -> am not / is not / are not
  "She ain’t here.",           // ain't   -> is not
  // IT domain
  "I gotta deploy the server.",   // gotta -> got to
  "We’re gonna refactor the code.", // gonna -> going to
  "You gotta check the logs.",    // gotta -> got to
  "I wanna merge this branch.",   // wanna -> want to
  // Banking domain
  "I wanna transfer some money.", // wanna -> want to
  "I gotta pay off the loan.",     // gotta -> got to
  "They’re gonna review my account.", // gonna -> going to
  "I hafta update my PIN."         // hafta -> have to
];

const intro = "Welcome. Let's learn how to pronounce some words and sentences. This part is single word reductions, like wanna, gonna, and gotta. Listen and repeat.";
const text = [intro, ...sentences].join(" ");

for (const { name, file } of VOICES) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(name, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const dest = join(OUT_DIR, file);
  const { audioStream } = tts.toStream(text);
  const out = createWriteStream(dest);

  await new Promise((resolve, reject) => {
    audioStream.pipe(out);
    audioStream.on("end", resolve);
    audioStream.on("error", reject);
    out.on("error", reject);
  });

  console.log(`Success! Saved ${dest} using voice ${name}`);
}

process.exit(0);
