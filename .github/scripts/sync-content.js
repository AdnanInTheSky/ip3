const { execFileSync, spawnSync } = require('node:child_process');

const BOT_NAME = 'github-actions[bot]';
const BOT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

function isAncestor(ancestor, descendant, cwd) {
  const result = spawnSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], { cwd, encoding: 'utf8' });
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  throw new Error(result.stderr || 'Could not compare the content and default branch histories.');
}

async function dispatchContentCheck({ repository, token, fetchImpl, log }) {
  const response = await fetchImpl(`https://api.github.com/repos/${repository}/actions/workflows/check.yml/dispatches`, {
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
  log('Explicitly dispatched Content check for the content branch head.');
}

async function syncContent({ cwd = process.cwd(), base, repository, token, fetchImpl = fetch, log = console.log }) {
  if (!repository || !base || base === 'content' || !token) throw new Error('Missing repository sync settings.');

  git(['fetch', 'origin', `+refs/heads/${base}:refs/remotes/origin/${base}`], cwd);
  const contentRef = spawnSync('git', ['ls-remote', '--exit-code', '--heads', 'origin', 'refs/heads/content'], { cwd, encoding: 'utf8' });
  if (contentRef.status === 2 || (contentRef.status === 0 && !contentRef.stdout.trim())) {
    log('No origin/content branch exists; skipping the content sync. Create content from the default branch when editor publishing is ready.');
    return { status: 'skipped' };
  }
  if (contentRef.status !== 0) throw new Error(contentRef.stderr || 'Could not check whether origin/content exists.');

  git(['fetch', 'origin', '+refs/heads/content:refs/remotes/origin/content'], cwd);
  git(['switch', '--create', 'content', '--track', 'origin/content'], cwd);
  git(['config', 'user.name', BOT_NAME], cwd);
  git(['config', 'user.email', BOT_EMAIL], cwd);

  const contentBefore = git(['rev-parse', 'HEAD'], cwd);
  const mainHead = git(['rev-parse', `refs/remotes/origin/${base}`], cwd);
  let shouldPush = false;

  if (isAncestor(contentBefore, mainHead, cwd)) {
    if (contentBefore !== mainHead) {
      git(['reset', '--hard', mainHead], cwd);
      shouldPush = true;
      log(`Advanced content to ${mainHead.slice(0, 12)} because it had no commits absent from ${base}.`);
    } else log('content already matches the default branch.');
  } else if (!isAncestor(mainHead, contentBefore, cwd)) {
    const merge = spawnSync('git', ['merge', '--no-edit', mainHead], { cwd, encoding: 'utf8' });
    if (merge.status !== 0) {
      if (merge.stdout) log(merge.stdout.trim());
      if (merge.stderr) log(merge.stderr.trim());
      spawnSync('git', ['merge', '--abort'], { cwd, encoding: 'utf8' });
      throw new Error(`Conflict while merging ${base} into content. Nothing was pushed. Resolve the conflict on content, then rerun the sync.`);
    }
    shouldPush = git(['rev-parse', 'HEAD'], cwd) !== contentBefore;
  } else log(`content already includes ${base}.`);

  if (shouldPush) {
    const contentAfter = git(['rev-parse', 'HEAD'], cwd);
    git(['push', 'origin', 'HEAD:refs/heads/content'], cwd);
    log(`Synchronized ${base} ${mainHead.slice(0, 12)} into content (${contentAfter.slice(0, 12)}).`);
  }

  // GITHUB_TOKEN pushes do not start ordinary push workflows; dispatch the check for this exact ref.
  await dispatchContentCheck({ repository, token, fetchImpl, log });
  return { status: 'synced', pushed: shouldPush };
}

async function main() {
  await syncContent({
    base: process.env.DEFAULT_BRANCH,
    repository: process.env.GITHUB_REPOSITORY,
    token: process.env.GITHUB_TOKEN,
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}

module.exports = { syncContent };
