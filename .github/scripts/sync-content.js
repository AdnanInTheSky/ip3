const { execFileSync, spawnSync } = require('node:child_process');

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const base = process.env.DEFAULT_BRANCH;
if (!token || !repository || !base || base === 'content') throw new Error('Missing repository sync settings.');

function git(args, options = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], ...options }).trim();
}

async function dispatchContentCheck() {
  const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/check.yml/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'content' }),
  });
  if (!response.ok) throw new Error(`Could not dispatch the content check (HTTP ${response.status}).`);
  console.log('Explicitly dispatched Content check for the content branch head.');
}

async function main() {
  git(['fetch', 'origin', `+refs/heads/${base}:refs/remotes/origin/${base}`, '+refs/heads/content:refs/remotes/origin/content']);
  git(['switch', '--create', 'content', '--track', 'origin/content']);
  git(['config', 'user.name', 'github-actions[bot]']);
  git(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  const contentBefore = git(['rev-parse', 'HEAD']);
  const mainHead = git(['rev-parse', `origin/${base}`]);
  const merge = spawnSync('git', ['merge', '--no-edit', `origin/${base}`], { encoding: 'utf8' });
  if (merge.status !== 0) {
    if (merge.stdout) process.stdout.write(merge.stdout);
    if (merge.stderr) process.stderr.write(merge.stderr);
    throw new Error('Could not merge main into content. Resolve the content-branch conflict, then dispatch Content check.');
  }
  const contentAfter = git(['rev-parse', 'HEAD']);
  if (contentAfter !== contentBefore) {
    git(['push', 'origin', 'HEAD:refs/heads/content']);
    console.log(`Merged ${mainHead.slice(0, 12)} into content (${contentAfter.slice(0, 12)}).`);
  } else {
    console.log('content already includes main.');
  }
  // GITHUB_TOKEN pushes do not start ordinary push workflows; dispatch the check for this exact ref.
  await dispatchContentCheck();
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
