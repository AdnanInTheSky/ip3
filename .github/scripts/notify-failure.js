const { execFileSync } = require('node:child_process');

const webhook = process.env.CI_FAILURE_WEBHOOK_URL;
if (!webhook) {
  console.log('CI_FAILURE_WEBHOOK_URL is not set; failure notification skipped.');
  process.exit(0);
}

async function main() {
  let logs = '';
  try {
    logs = execFileSync('gh', ['run', 'view', String(process.env.WORKFLOW_RUN_ID), '--log-failed', '--repo', process.env.GITHUB_REPOSITORY], {
      encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    });
  } catch (error) {
    logs = error.stdout ? String(error.stdout) : '';
  }
  const lines = logs.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const errors = lines.filter((line) => /error|failed|failure|exception|invalid|not found|could not|cannot/i.test(line)).slice(0, 20);
  if (!errors.length) errors.push(...(lines.slice(0, 20).length ? lines.slice(0, 20) : ['Failed workflow logs were unavailable.']));
  let author = process.env.COMMIT_AUTHOR || '';
  try { author = execFileSync('git', ['show', '-s', '--format=%an', process.env.COMMIT_SHA], { encoding: 'utf8' }).trim() || author; } catch {}
  const payload = {
    commit: process.env.COMMIT_SHA || '',
    author,
    errors,
  };
  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Failure webhook returned HTTP ${response.status}.`);
  console.log('Failure notification sent.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
