import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'output');
const FFMPEG = ffmpegPath.path;

const rawWebm = path.join(OUT, 'transitops-demo-raw.webm');
const narrationWav = path.join(OUT, 'narration.wav');
const finalMp4 = path.join(OUT, 'TransitOps-Demo.mp4');
const srt = path.join(__dirname, '..', 'transitops-demo.srt');

function run(args) {
  const result = spawnSync(FFMPEG, args, { stdio: 'inherit', shell: false });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed: ${args.join(' ')}`);
  }
}

if (!fs.existsSync(rawWebm)) {
  console.error('Missing raw webm. Run npm run record first.');
  process.exit(1);
}

// Generate narration with Windows SAPI via PowerShell if narration.wav missing
if (!fs.existsSync(narrationWav)) {
  console.log('Generating narration with Windows TTS...');
  const narrationTxt = path.join(__dirname, 'narration.txt');
  const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 100
$text = Get-Content -Raw '${narrationTxt.replace(/'/g, "''")}'
$synth.SetOutputToWaveFile('${narrationWav.replace(/'/g, "''")}')
$synth.Speak($text)
$synth.Dispose()
`;
  const psFile = path.join(OUT, 'tts.ps1');
  fs.writeFileSync(psFile, psScript);
  spawnSync('powershell', ['-ExecutionPolicy', 'Bypass', '-File', psFile], { stdio: 'inherit' });
}

if (!fs.existsSync(narrationWav)) {
  console.warn('No narration audio — exporting silent video.');
  run([
    '-y', '-i', rawWebm,
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p',
    finalMp4,
  ]);
} else {
  console.log('Merging video + narration...');
  run([
    '-y',
    '-i', rawWebm,
    '-i', narrationWav,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    '-pix_fmt', 'yuv420p',
    finalMp4,
  ]);
}

// Copy to demo-video folder for easy access
const copyTo = path.join(__dirname, '..', 'TransitOps-Demo.mp4');
fs.copyFileSync(finalMp4, copyTo);

console.log('\n✅ Demo video ready:');
console.log(`   ${finalMp4}`);
console.log(`   ${copyTo}`);

if (fs.existsSync(srt)) {
  console.log(`\n📝 Subtitles: ${srt}`);
  console.log('   Import into YouTube when uploading for captions.');
}

console.log('\n📤 To share publicly, upload TransitOps-Demo.mp4 to YouTube (Unlisted) and share the link.');
