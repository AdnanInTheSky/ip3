const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { syncContent } = require('./sync-content');
const { openContentPr } = require('./open-content-pr');

const TOKEN = 'test-token';
const REPOSITORY = 'owner/site';

function git(cwd, ...args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

function makeRepo(t, { content = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-publishing-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const remote = path.join(root, 'remote.git');
  const cwd = path.join(root, 'work');
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  fs.mkdirSync(cwd);
  git(cwd, 'init', '--initial-branch=main');
  git(cwd, 'config', 'user.name', 'Test Editor');
  git(cwd, 'config', 'user.email', 'test@example.org');
  fs.mkdirSync(path.join(cwd, 'content'), { recursive: true });
  fs.writeFileSync(path.join(cwd, 'content', 'about.json'), '{"title":"Initial"}\n');
  git(cwd, 'add', '.');
  git(cwd, 'commit', '-m', 'initial');
  git(cwd, 'remote', 'add', 'origin', remote);
  git(cwd, 'push', '-u', 'origin', 'main');

  if (content) {
    git(cwd, 'switch', '-c', 'content');
    git(cwd, 'push', 'origin', 'content');
    git(cwd, 'switch', 'main');
    git(cwd, 'branch', '-D', 'content');
  }
  return { root, remote, cwd };
}

function commitOn(cwd, branch, file, contents) {
  git(cwd, 'switch', branch);
  const target = path.join(cwd, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
  git(cwd, 'add', file);
  git(cwd, 'commit', '-m', `update ${file}`);
  git(cwd, 'push', 'origin', branch);
  const sha = git(cwd, 'rev-parse', 'HEAD');
  git(cwd, 'switch', 'main');
  git(cwd, 'branch', '-D', branch);
  return sha;
}

function response(body, status = 200) {
  const payload = body === undefined || [204, 205, 304].includes(status) ? null : JSON.stringify(body);
  return new Response(payload, { status, headers: { 'Content-Type': 'application/json' } });
}

function apiFetchForRepo({ cwd, openPulls = [] }) {
  const calls = [];
  const fetchImpl = async (input, options = {}) => {
    const url = new URL(input);
    calls.push({ url, options });
    if (url.pathname === '/repos/owner/site') return response({ default_branch: 'main' });
    if (url.pathname.endsWith('/branches/content')) return response({ commit: { sha: git(cwd, 'rev-parse', 'refs/remotes/origin/content') } });
    if (url.pathname.endsWith('/compare/main...content')) {
      const ahead = Number(git(cwd, 'rev-list', '--count', 'refs/remotes/origin/main..refs/remotes/origin/content'));
      const names = git(cwd, 'diff', '--name-status', 'refs/remotes/origin/main...refs/remotes/origin/content');
      const files = names ? names.split('\n').map((row) => {
        const [status, filename] = row.split('\t');
        return { status: status === 'A' ? 'added' : status === 'D' ? 'removed' : 'modified', filename };
      }) : [];
      return response({ ahead_by: ahead, files });
    }
    if (url.pathname.endsWith('/pulls/7') && options.method === 'PATCH') return response({ number: 7, html_url: 'https://github.com/owner/site/pull/7' });
    if (url.pathname.endsWith('/pulls') && options.method === 'POST') return response({ number: 8, html_url: 'https://github.com/owner/site/pull/8' }, 201);
    if (url.pathname.endsWith('/pulls')) return response(openPulls);
    return response({ message: `Unexpected mocked endpoint ${url.pathname}` }, 404);
  };
  return { fetchImpl, calls };
}

test('sync-content skips cleanly when origin/content has not been created', async (t) => {
  const { cwd } = makeRepo(t, { content: false });
  const logs = [];
  let dispatches = 0;
  const result = await syncContent({
    cwd, base: 'main', repository: REPOSITORY, token: TOKEN,
    fetchImpl: async () => { dispatches += 1; return response(undefined, 204); }, log: (line) => logs.push(line),
  });
  assert.equal(result.status, 'skipped');
  assert.match(logs.join('\n'), /No origin\/content branch exists; skipping/);
  assert.equal(dispatches, 0);
});

test('sync-content fast-forwards content when all its commits already exist on main', async (t) => {
  const { cwd } = makeRepo(t);
  const mainFile = path.join(cwd, 'main-update.txt');
  fs.writeFileSync(mainFile, 'already merged\n');
  git(cwd, 'add', 'main-update.txt');
  git(cwd, 'commit', '-m', 'main content merge');
  git(cwd, 'push', 'origin', 'main');
  const mainSha = git(cwd, 'rev-parse', 'HEAD');
  let dispatchedRef;
  const result = await syncContent({
    cwd, base: 'main', repository: REPOSITORY, token: TOKEN,
    fetchImpl: async (url, options) => { dispatchedRef = JSON.parse(options.body).ref; return response(undefined, 204); },
    log() {},
  });
  assert.equal(result.status, 'synced');
  assert.equal(result.pushed, true);
  assert.equal(git(cwd, 'rev-parse', 'refs/remotes/origin/content'), mainSha);
  assert.equal(dispatchedRef, 'content');
});

test('sync-content reports and aborts a real merge conflict without dispatching', async (t) => {
  const { cwd } = makeRepo(t);
  commitOn(cwd, 'content', 'content/about.json', '{"title":"Editor version"}\n');
  git(cwd, 'switch', 'main');
  fs.writeFileSync(path.join(cwd, 'content', 'about.json'), '{"title":"Main version"}\n');
  git(cwd, 'add', 'content/about.json');
  git(cwd, 'commit', '-m', 'change same content on main');
  git(cwd, 'push', 'origin', 'main');
  let dispatches = 0;
  await assert.rejects(syncContent({
    cwd, base: 'main', repository: REPOSITORY, token: TOKEN,
    fetchImpl: async () => { dispatches += 1; return response(undefined, 204); }, log() {},
  }), /Conflict while merging main into content\. Nothing was pushed/);
  assert.equal(dispatches, 0);
  assert.equal(git(cwd, 'status', '--porcelain'), '');
});

test('open-content-pr ignores a stale successful check for an older branch head', async (t) => {
  const { cwd } = makeRepo(t);
  const { fetchImpl, calls } = apiFetchForRepo({ cwd });
  const result = await openContentPr({ token: TOKEN, repo: REPOSITORY, head: 'content', checkedSha: '0'.repeat(40), fetchImpl, log() {} });
  assert.equal(result.status, 'stale');
  assert.equal(calls.some((call) => call.url.pathname.endsWith('/compare/main...content')), false);
});

test('open-content-pr opens or updates a content PR from local Git diff data', async (t) => {
  const { cwd } = makeRepo(t);
  const checkedSha = commitOn(cwd, 'content', 'content/about.json', '{"title":"Editor update"}\n');
  git(cwd, 'fetch', 'origin');
  const mock = apiFetchForRepo({ cwd });
  const opened = await openContentPr({ token: TOKEN, repo: REPOSITORY, head: 'content', checkedSha, fetchImpl: mock.fetchImpl, log() {} });
  assert.deepEqual(opened, { status: 'opened', number: 8 });
  const post = mock.calls.find((call) => call.options.method === 'POST');
  const body = JSON.parse(post.options.body);
  assert.equal(body.head, 'content');
  assert.match(body.body, /content\/about\.json/);
  assert.match(body.body, /Create a merge commit/);

  const existing = [{ number: 7, html_url: 'https://github.com/owner/site/pull/7' }];
  const updateMock = apiFetchForRepo({ cwd, openPulls: existing });
  const updated = await openContentPr({ token: TOKEN, repo: REPOSITORY, head: 'content', checkedSha, fetchImpl: updateMock.fetchImpl, log() {} });
  assert.deepEqual(updated, { status: 'updated', number: 7 });
  assert.equal(updateMock.calls.some((call) => call.options.method === 'PATCH'), true);
});
