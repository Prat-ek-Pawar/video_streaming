import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'child_process';

console.log('ffmpeg-static path:', ffmpegStatic);

const cmd = ffmpegStatic;
const args = ['-version'];
const quotedCmd = `"${cmd}"`;

console.log('Running with quotes:', quotedCmd);

const proc = spawn(quotedCmd, args, { shell: true });

proc.stdout.on('data', (d) => console.log(d.toString()));
proc.stderr.on('data', (d) => console.error(d.toString()));
proc.on('close', (c) => console.log('Exit code:', c));
proc.on('error', (e) => console.error('Error:', e));
