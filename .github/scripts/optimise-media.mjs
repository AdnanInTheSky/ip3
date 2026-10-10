import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');
const root = process.cwd();
const sourceRoot = path.resolve(process.env.MEDIA_SOURCE_DIR || root);
const KB = 1024;
const IMAGE_TARGET = 500 * KB;
const IMAGE_HARD_LIMIT = 2 * 1024 * KB;
const VIDEO_TARGET = 8 * 1024 * KB;
const VIDEO_HARD_LIMIT = 25 * 1024 * KB;
const TEST_MODE = process.argv.includes('--test');

function runGit(args, cwd = root) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
}

function collectVideoReferences(value, key = '', inVideo = false, output = new Set()) {
  if (typeof value === 'string') {
    if ((key === 'video' || key === 'src' || inVideo) && value.startsWith('/assets/video/')) output.add(value.slice(1));
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectVideoReferences(item, key, inVideo, output));
  } else if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) collectVideoReferences(child, childKey, inVideo || childKey === 'video', output);
  }
  return output;
}

function mutedBackgroundVideos(source) {
  const muted = new Set();
  for (const file of walk(path.join(source, 'content')).filter((candidate) => candidate.endsWith('.json'))) {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const video of collectVideoReferences(content)) muted.add(video);
  }
  // Hard-coded page media is passed to the shared phero video renderer or a muted home background.
  for (const file of [path.join(source, 'src/pages-home.js'), path.join(source, 'src/pages-inner.js')]) {
    if (!fs.existsSync(file)) continue;
    const contents = fs.readFileSync(file, 'utf8');
    for (const match of contents.matchAll(/['"](\/assets\/video\/[a-zA-Z0-9._-]+\.(?:mp4|webm))['"]/g)) muted.add(match[1].slice(1));
  }
  return muted;
}

function safeAssetPath(relative) {
  const normalized = relative.split(path.sep).join('/');
  if (!/^assets\/(?:img|video)\/[A-Za-z0-9._/-]+$/.test(normalized) || normalized.split('/').includes('..')) return null;
  const absolute = path.resolve(sourceRoot, normalized);
  const relativeToSource = path.relative(sourceRoot, absolute);
  if (relativeToSource.startsWith(`..${path.sep}`) || relativeToSource === '..' || path.isAbsolute(relativeToSource)) return null;
  return absolute;
}

async function optimiseImage(file) {
  const before = fs.statSync(file).size;
  if (before <= IMAGE_TARGET) return { changed: false, before, after: before, reason: 'under target' };
  const extension = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) return { changed: false, before, after: before, reason: 'unsupported image extension' };

  const temporary = `${file}.optimised${extension}`;
  const qualities = extension === '.png' ? [undefined] : [82, 74, 66, 60];
  let smallest = null;
  try {
    for (const quality of qualities) {
      let image = sharp(file, { failOn: 'none' }).rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true });
      if (extension === '.jpg' || extension === '.jpeg') image = image.jpeg({ quality, mozjpeg: true });
      else if (extension === '.webp') image = image.webp({ quality, effort: 5 });
      else image = image.png({ compressionLevel: 9, adaptiveFiltering: true });
      await image.toFile(temporary);
      const after = fs.statSync(temporary).size;
      if (smallest === null || after < smallest.after) {
        if (smallest && fs.existsSync(smallest.file)) fs.unlinkSync(smallest.file);
        const saved = `${file}.candidate${extension}`;
        fs.renameSync(temporary, saved);
        smallest = { file: saved, after };
      } else fs.unlinkSync(temporary);
      if (after <= IMAGE_TARGET) break;
    }
    if (!smallest || smallest.after >= before || smallest.after > IMAGE_HARD_LIMIT) {
      if (smallest && fs.existsSync(smallest.file)) fs.unlinkSync(smallest.file);
      return { changed: false, before, after: before, reason: 'could not reduce below the hard limit' };
    }
    fs.renameSync(smallest.file, file);
    return { changed: true, before, after: smallest.after };
  } finally {
    for (const candidate of [temporary, `${file}.candidate${extension}`]) if (fs.existsSync(candidate)) fs.unlinkSync(candidate);
  }
}

function optimiseVideo(file, muted) {
  const before = fs.statSync(file).size;
  if (before <= VIDEO_TARGET) return { changed: false, before, after: before, reason: 'under target' };
  if (path.extname(file).toLowerCase() !== '.mp4' || !ffmpeg) return { changed: false, before, after: before, reason: 'H.264 MP4 transcoder unavailable for this format' };

  const temporary = `${file}.optimised.mp4`;
  const args = [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', file,
    '-map_metadata', '-1', '-map', '0:v:0', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26',
    '-vf', "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
    '-pix_fmt', 'yuv420p',
  ];
  if (muted) args.push('-an');
  else args.push('-map', '0:a?', '-c:a', 'aac', '-b:a', '128k');
  args.push('-movflags', '+faststart', temporary);

  const result = spawnSync(ffmpeg, args, { encoding: 'utf8', windowsHide: true });
  if (result.error || result.status !== 0 || !fs.existsSync(temporary)) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    return { changed: false, before, after: before, reason: 'ffmpeg could not transcode this file' };
  }
  const after = fs.statSync(temporary).size;
  if (after >= before || after > VIDEO_HARD_LIMIT) {
    fs.unlinkSync(temporary);
    return { changed: false, before, after: before, reason: 'could not reduce below the hard limit' };
  }
  fs.renameSync(temporary, file);
  return { changed: true, before, after };
}

async function processFiles(files, source) {
  const muted = mutedBackgroundVideos(source);
  const changed = [];
  for (const relative of files) {
    const file = safeAssetPath(relative);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    const normalized = relative.split(path.sep).join('/');
    const isImage = normalized.startsWith('assets/img/');
    const isVideo = normalized.startsWith('assets/video/');
    if (!isImage && !isVideo) continue;
    let result;
    try {
      result = isImage ? await optimiseImage(file) : optimiseVideo(file, muted.has(normalized));
    } catch {
      result = { changed: false, before: fs.statSync(file).size, after: fs.statSync(file).size, reason: 'optimizer error; original retained' };
    }
    const label = result.changed ? `${(result.before / KB).toFixed(0)} KB → ${(result.after / KB).toFixed(0)} KB` : result.reason;
    console.log(`${result.changed ? 'Optimized' : 'Kept'} ${normalized}: ${label}`);
    if (result.changed) changed.push(normalized);
  }
  return changed;
}

async function runTestMode() {
  const files = walk(path.join(sourceRoot, 'assets')).map((file) => path.relative(sourceRoot, file));
  const changed = await processFiles(files, sourceRoot);
  console.log(`Scratch media test processed ${files.length} files and changed ${changed.length}.`);
}

async function main() {
  if (TEST_MODE) return runTestMode();
  const branch = process.env.CHECKED_BRANCH;
  const checkedSha = process.env.CHECKED_SHA;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const defaultBranch = process.env.DEFAULT_BRANCH;
  if (!branch || !checkedSha || !repository || !token || !defaultBranch || branch === defaultBranch || branch.startsWith('-') || !/^[A-Za-z0-9._/-]+$/.test(branch)) {
    throw new Error('Missing or unsafe media workflow settings.');
  }

  runGit(['fetch', 'origin', `+refs/heads/${defaultBranch}:refs/remotes/origin/${defaultBranch}`, `+refs/heads/${branch}:refs/remotes/origin/${branch}`]);
  const branchHead = runGit(['rev-parse', `refs/remotes/origin/${branch}`]);
  if (branchHead !== checkedSha) {
    console.log(`Skipping stale check ${checkedSha.slice(0, 12)}; ${branch} is now ${branchHead.slice(0, 12)}.`);
    return;
  }
  const base = runGit(['merge-base', `refs/remotes/origin/${defaultBranch}`, checkedSha]);
  const files = runGit(['diff', '--name-only', base, checkedSha, '--', 'assets/img', 'assets/video']).split(/\r?\n/).filter(Boolean);
  const changed = await processFiles(files, sourceRoot);
  if (!changed.length) {
    console.log('No media file changed. The existing Content check remains authoritative; hard-limit violations stay unchanged for validation to report.');
    return;
  }

  runGit(['switch', '--create', branch, `--track`, `refs/remotes/origin/${branch}`]);
  for (const relative of changed) {
    const source = safeAssetPath(relative);
    const destination = path.resolve(root, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
    runGit(['add', '--', relative]);
  }
  const staged = spawnSync('git', ['diff', '--cached', '--quiet'], { cwd: root, stdio: 'ignore' });
  if (staged.status === 0) return;
  if (staged.status !== 1) throw new Error('Could not inspect optimized media changes.');
  runGit(['config', 'user.name', 'github-actions[bot]']);
  runGit(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  runGit(['commit', '-m', 'Optimize uploaded media']);
  runGit(['push', 'origin', `HEAD:refs/heads/${branch}`]);
  const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/check.yml/dispatches`, {
    method: 'POST',
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: branch }),
  });
  if (!response.ok) throw new Error(`Optimized media was pushed, but Content check dispatch failed (HTTP ${response.status}).`);
  console.log('Dispatched Content check for the optimized branch head.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
