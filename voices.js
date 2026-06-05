// Shared voice list for every generator. Each entry produces one mp3 per set.
// Add/remove a voice here and every set + the combiner + the web page follow.
//
// NOTE: the lessons teach AMERICAN connected speech. The US voices perform the
// reductions; every other accent reads the same text in its own accent. The
// en-* voices (IN/AU/SG) are real English accents. The TH/RU/JP/ZH entries are
// the engine's *native-language* voices reading English — heavily accented and
// sometimes rough (JP/ZH especially) — included only for accent comparison.
export const jobs = [
  // Native English accents
  { voice: "en-US-AvaNeural",                 file: "us-female.mp3", label: "US · Ava" },
  { voice: "en-US-AndrewNeural",              file: "us-male.mp3",   label: "US · Andrew" },
  { voice: "en-GB-SoniaNeural",               file: "gb-female.mp3", label: "British · Sonia" },
  { voice: "en-GB-RyanNeural",                file: "gb-male.mp3",   label: "British · Ryan" },
  { voice: "en-IN-NeerjaNeural",              file: "in-female.mp3", label: "Indian · Neerja" },
  { voice: "en-IN-PrabhatNeural",             file: "in-male.mp3",   label: "Indian · Prabhat" },
  { voice: "en-AU-NatashaNeural",             file: "au-female.mp3", label: "Australian · Natasha" },
  { voice: "en-AU-WilliamMultilingualNeural", file: "au-male.mp3",   label: "Australian · William" },
  { voice: "en-SG-LunaNeural",                file: "sg-female.mp3", label: "Singapore · Luna" },
  { voice: "en-SG-WayneNeural",               file: "sg-male.mp3",   label: "Singapore · Wayne" },
  // Non-native accents (native-language engine reading English — experimental)
  { voice: "th-TH-PremwadeeNeural",           file: "th-female.mp3", label: "Thai · Premwadee" },
  { voice: "th-TH-NiwatNeural",               file: "th-male.mp3",   label: "Thai · Niwat" },
  { voice: "ru-RU-SvetlanaNeural",            file: "ru-female.mp3", label: "Russian · Svetlana" },
  { voice: "ru-RU-DmitryNeural",              file: "ru-male.mp3",   label: "Russian · Dmitry" },
  { voice: "ja-JP-NanamiNeural",              file: "jp-female.mp3", label: "Japanese · Nanami" },
  { voice: "ja-JP-KeitaNeural",               file: "jp-male.mp3",   label: "Japanese · Keita" },
  { voice: "zh-CN-XiaoxiaoNeural",            file: "zh-female.mp3", label: "Chinese · Xiaoxiao" },
  { voice: "zh-CN-YunxiNeural",               file: "zh-male.mp3",   label: "Chinese · Yunxi" },
];
