const apiBase = 'https://api.github.com';

async function openContentPr({ token, repo, head, checkedSha, fetchImpl = fetch, log = console.log }) {
  if (!token || !repo || head !== 'content' || !/^[a-f0-9]{40}$/i.test(checkedSha || '')) {
    throw new Error('Expected the repository token, content branch and checked commit SHA.');
  }

  async function api(path, options = {}) {
    const response = await fetchImpl(`${apiBase}${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}: ${body.message || 'request failed'}`);
    return body;
  }

  const [owner, name] = repo.split('/');
  if (!owner || !name || repo.split('/').length !== 2) throw new Error('Expected GITHUB_REPOSITORY in owner/repo form.');
  const repository = await api(`/repos/${owner}/${name}`);
  const base = repository.default_branch;
  if (!base || base === head) throw new Error('Could not determine a distinct default branch for the content PR.');

  const branch = await api(`/repos/${owner}/${name}/branches/${encodeURIComponent(head)}`);
  if (branch.commit.sha !== checkedSha) {
    log(`content advanced beyond checked commit ${checkedSha.slice(0, 12)}; waiting for its own successful check.`);
    return { status: 'stale' };
  }

  const comparison = await api(`/repos/${owner}/${name}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);
  if (comparison.ahead_by === 0 || !comparison.files || comparison.files.length === 0) {
    log(`The ${head} branch has no file changes ahead of ${base}; no pull request is needed.`);
    return { status: 'unchanged' };
  }

  const changedContent = comparison.files.filter((file) => file.filename.startsWith('content/')).map((file) => `- \`${file.filename}\` (${file.status})`);
  const changedList = changedContent.length ? changedContent.join('\n') : '- No files under `content/` (review the code changes shown in the PR).';
  const body = [
    'Pages CMS content changes are ready for review.',
    '',
    'Changed content files:',
    changedList,
    '',
    'Please inspect the Vercel Preview linked to this PR and the successful `check` run before merging.',
    'This PR is opened only after the exact branch head passed the content check.',
    'Merge with **Create a merge commit** so the content and default-branch histories stay connected for the automatic sync.',
  ].join('\n');

  const query = new URLSearchParams({ state: 'open', head: `${owner}:${head}`, base });
  const open = await api(`/repos/${owner}/${name}/pulls?${query}`);
  if (open.length) {
    await api(`/repos/${owner}/${name}/pulls/${open[0].number}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
    });
    log(`Updated the open content review PR: ${open[0].html_url}`);
    return { status: 'updated', number: open[0].number };
  }

  const pull = await api(`/repos/${owner}/${name}/pulls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Review website content updates', head, base, body }),
  });
  log(`Opened content review PR: ${pull.html_url}`);
  return { status: 'opened', number: pull.number };
}

async function main() {
  await openContentPr({
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPOSITORY,
    head: process.env.CONTENT_BRANCH,
    checkedSha: process.env.CHECKED_SHA,
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { openContentPr };
