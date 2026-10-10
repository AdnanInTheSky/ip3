const apiBase = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;
const head = process.env.CONTENT_BRANCH;
const checkedSha = process.env.CHECKED_SHA;

if (!token || !repo || head !== 'content' || !/^[a-f0-9]{40}$/i.test(checkedSha || '')) throw new Error('Expected the repository token, content branch and checked commit SHA.');

async function api(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
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

async function main() {
  const [owner, name] = repo.split('/');
  const repository = await api(`/repos/${owner}/${name}`);
  const base = repository.default_branch;
  if (!base || base === head) throw new Error('Could not determine a distinct default branch for the content PR.');

  const branch = await api(`/repos/${owner}/${name}/branches/${encodeURIComponent(head)}`);
  if (branch.commit.sha !== checkedSha) {
    console.log(`content advanced beyond checked commit ${checkedSha.slice(0, 12)}; waiting for its own successful check.`);
    return;
  }

  const comparison = await api(`/repos/${owner}/${name}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`);
  if (comparison.ahead_by === 0 || !comparison.files || comparison.files.length === 0) {
    console.log(`The ${head} branch has no file changes ahead of ${base}; no pull request is needed.`);
    return;
  }

  const changedContent = (comparison.files || []).filter((file) => file.filename.startsWith('content/')).map((file) => `- \`${file.filename}\` (${file.status})`);
  const changedList = changedContent.length ? changedContent.join('\n') : '- No files under `content/` (review the code changes shown in the PR).';
  const body = [
    'Pages CMS content changes are ready for review.',
    '',
    'Changed content files:',
    changedList,
    '',
    'Please inspect the Vercel Preview deployment and the successful `Content check / check` run before merging.',
    'This PR is opened only after the exact branch head passed the content check.',
  ].join('\n');

  const query = new URLSearchParams({ state: 'open', head: `${owner}:${head}`, base });
  const open = await api(`/repos/${owner}/${name}/pulls?${query}`);
  if (open.length) {
    await api(`/repos/${owner}/${name}/pulls/${open[0].number}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body }),
    });
    console.log(`Updated the open content review PR: ${open[0].html_url}`);
    return;
  }

  const pull = await api(`/repos/${owner}/${name}/pulls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Review website content updates',
      head,
      base,
      body,
    }),
  });
  console.log(`Opened content review PR: ${pull.html_url}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
