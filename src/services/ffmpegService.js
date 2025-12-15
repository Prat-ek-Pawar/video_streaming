import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.js';

const runCommand = (cmd, args, cwd) => {
  return new Promise((resolve, reject) => {
    console.log(`Spawning: ${cmd} ${args.join(' ')}`);
    const proc = spawn(cmd, args, { cwd, shell: false });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      if (stdout.length < 2000) stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      if (stderr.length > 5000) {
        stderr = stderr.substring(stderr.length - 5000);
      }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        console.error('FFmpeg error code:', code);
        reject(new Error(`Process exited with code ${code}. Last error: ${stderr.substring(Math.max(0, stderr.length - 500))}`));
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
};

const hasAudioStream = async (filePath) => {
  try {
    const args = ['-i', filePath];
    return true; 
  } catch (e) {
    return false;
  }
};

export const transcodeVideo = async (sourcePath, outputDir) => {
  const resolutions = [
    { name: '240p', w: -2, h: 240, bitrate: '400k' },
    { name: '480p', w: -2, h: 480, bitrate: '1000k' },
    { name: '720p', w: -2, h: 720, bitrate: '2500k' }
  ];

  const filterComplex = `[0:v]split=3[v1][v2][v3];[v1]scale=-2:240[o1];[v2]scale=-2:480[o2];[v3]scale=-2:720[o3]`;
  
  const cmdArgs = [
    '-i', sourcePath,
    '-filter_complex', filterComplex,
    
    '-map', '[o1]',
    '-c:v:0', 'libx264', '-b:v:0', '400k', '-maxrate:v:0', '450k', '-bufsize:v:0', '800k',
    '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    
    '-map', '[o2]',
    '-c:v:1', 'libx264', '-b:v:1', '1000k', '-maxrate:v:1', '1200k', '-bufsize:v:1', '2000k',
    '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    
    '-map', '[o3]',
    '-c:v:2', 'libx264', '-b:v:2', '2500k', '-maxrate:v:2', '3000k', '-bufsize:v:2', '5000k',
    '-g', '48', '-keyint_min', '48', '-sc_threshold', '0',
    
    '-map', '0:a', '-c:a:0', 'aac', '-b:a:0', '96k',
    '-map', '0:a', '-c:a:1', 'aac', '-b:a:1', '128k',
    '-map', '0:a', '-c:a:2', 'aac', '-b:a:2', '128k',
    
    '-f', 'hls',
    '-var_stream_map', 'v:0,a:0,name:240p v:1,a:1,name:480p v:2,a:2,name:720p',
    '-hls_time', '2',
    '-hls_playlist_type', 'vod',
    '-hls_segment_filename', path.join(outputDir, '%v_%03d.ts'),
    '-master_pl_name', 'master.m3u8',
    path.join(outputDir, '%v.m3u8')
  ];

  await runCommand(config.ffmpegPath, cmdArgs, outputDir);
  
  return {
    masterPlaylist: 'master.m3u8',
    variants: [
      { quality: 240, playlist: '240p.m3u8' },
      { quality: 480, playlist: '480p.m3u8' },
      { quality: 720, playlist: '720p.m3u8' }
    ]
  }
};
