import fs from 'fs';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const ffmpegPath = process.env.FFMPEG_PATH;
console.log('Testing FFmpeg Path:', ffmpegPath);

if (!fs.existsSync(ffmpegPath)) {
    console.error('❌ FFmpeg executable NOT found at path!');
    process.exit(1);
} else {
    console.log('✅ File exists at path.');
}

console.log('Attempting to spawn ffmpeg -version...');
const proc = spawn(ffmpegPath, ['-version'], { shell: true });

proc.stdout.on('data', (d) => console.log('stdout:', d.toString()));
proc.stderr.on('data', (d) => console.error('stderr:', d.toString()));
proc.on('close', (code) => console.log('Exited with code:', code));
proc.on('error', (err) => console.error('Spawn error:', err));
