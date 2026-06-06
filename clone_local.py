"""
Local, FREE voice cloning -> spoken-intro generator (F5-TTS). 100% offline after
the first model download, no API key, no cost.

  python clone_local.py                       # uses sample.wav + intro.txt
  python clone_local.py --text "Hello there"  # speak custom text
  python clone_local.py --sample voice.wav --output out.mp3 --ref-seconds 10

See VOICE-CLONING.md for the full guide.

NOTE: only clone a voice you OWN or have CONSENT to use.
"""
import os, sys, argparse, subprocess, shutil, datetime
import torch, soundfile as sf
import torchaudio

# torchaudio 2.x requires torchcodec (needs FFmpeg DLLs Windows lacks), so route
# its load/save through soundfile instead — works fine for WAV.
def _ta_load(path, *a, **k):
    data, sr = sf.read(str(path), dtype="float32", always_2d=True)
    return torch.from_numpy(data.T.copy()), sr
def _ta_save(path, tensor, sample_rate, *a, **k):
    arr = tensor.detach().cpu().numpy()
    sf.write(str(path), arr.T if arr.ndim == 2 else arr, sample_rate)
torchaudio.load = _ta_load
torchaudio.save = _ta_save


def ffmpeg_bin():
    return shutil.which("ffmpeg") or os.path.join("node_modules", "ffmpeg-static", "ffmpeg.exe")


def main():
    ap = argparse.ArgumentParser(description="Clone a voice from a sample and speak text (MP3).")
    ap.add_argument("--sample", default="sample.wav", help="reference voice WAV (default: sample.wav)")
    ap.add_argument("--text", default=None, help="text to speak (overrides --text-file)")
    ap.add_argument("--text-file", default="intro.txt", help="file with text to speak (default: intro.txt)")
    ap.add_argument("--output", default=None, help="output MP3 (default: <sample-name>_<datetime>.mp3)")
    ap.add_argument("--ref-seconds", type=int, default=12, help="seconds of the sample to use as reference (<=15 best)")
    args = ap.parse_args()

    # Default output keeps the source (video/sample) name and just appends a timestamp.
    if not args.output:
        base = os.path.splitext(os.path.basename(args.sample))[0]
        stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        args.output = f"{base}_{stamp}.mp3"

    ff = ffmpeg_bin()
    if not (shutil.which("ffmpeg") or os.path.exists(ff)):
        sys.exit("ffmpeg not found (expected node_modules/ffmpeg-static/ffmpeg.exe or ffmpeg on PATH)")
    if not os.path.exists(args.sample):
        sys.exit(f"Missing {args.sample}. Make one with:  node extract-audio.js \"your video.mp4\" sample.wav <start> <dur>")
    gen_text = args.text or (open(args.text_file, encoding="utf-8").read().strip() if os.path.exists(args.text_file) else None)
    if not gen_text:
        sys.exit(f"No text. Pass --text \"...\" or put text in {args.text_file}.")

    ref = "ref_clip.wav"
    print(f"1) trimming {args.sample} to {args.ref_seconds}s reference...", flush=True)
    subprocess.run([ff, "-y", "-i", args.sample, "-t", str(args.ref_seconds),
                    "-ar", "24000", "-ac", "1", ref], check=True, capture_output=True)

    print("2) transcribing the reference (faster-whisper tiny.en)...", flush=True)
    from faster_whisper import WhisperModel
    segs, _ = WhisperModel("tiny.en", device="cpu", compute_type="int8").transcribe(ref, beam_size=1)
    ref_text = " ".join(s.text.strip() for s in segs).strip()
    print(f"   reference text: {ref_text[:90]}...", flush=True)

    print("3) loading F5-TTS model (first run downloads ~1.3 GB)...", flush=True)
    from f5_tts.api import F5TTS
    tts = F5TTS()

    print("4) synthesizing cloned voice...  (CPU is SLOW — can take 20-30 min)", flush=True)
    wav_out = os.path.splitext(args.output)[0] + ".wav"
    tts.infer(ref_file=ref, ref_text=ref_text, gen_text=gen_text, file_wave=wav_out)

    print("5) converting to MP3...", flush=True)
    subprocess.run([ff, "-y", "-i", wav_out, "-b:a", "192k", args.output], check=True, capture_output=True)
    print(f"DONE -> {args.output}", flush=True)


if __name__ == "__main__":
    main()
