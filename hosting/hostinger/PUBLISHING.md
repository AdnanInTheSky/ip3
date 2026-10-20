# Hostinger publishing design — local proof of concept only

The [master-task local implementation report](../../docs/local-preparation-20261017/IMPLEMENTATION_REPORT.md) records the fresh-output builder, pinned package verification and current draft evidence. New candidate commands must specify a fresh local output and SOURCE_DATE_EPOCH; the preserved original POC output is not overwritten. Upload and activation remain unavailable.

Date: 17 October 2026 (Asia/Dhaka). No remote workflow, SSH connection, upload, key creation, domain change or live promotion has been performed.

## Conclusion

Pages CMS and its JSON schema do not depend on the public website host. Retain **Pages CMS → content branch → validation → review PR → explicitly approved main commit → Node.js 24 build → generated static release**. Hostinger would receive only the built public files and reviewed PHP/routing overlay. It must not receive `.git`, source, content JSON, build tools, credentials or the existing WordPress filesystem. No separate CMS is required.

The proposed transport is **SFTP over SSH**, available on Business according to Hostinger's official documentation. Account-specific enablement, path restrictions, key acceptance, fingerprint, rate limits and permissions are **unverified**. No service has been enabled. Hostinger documents LiteSpeed and `.htaccess`, and says symlinks are disabled by default. Therefore this design does not require symlinks, root, vhost changes or disabling security functions.

## Local POC implemented

`publishing/release-plan.cjs` inventories already-built output, hashes each file with SHA-256 and checks the 21 expected pages plus build identity, sitemap, robots and manifest. Exact expected sector slugs come from the unchanged content model. Ordinary mode permits built static files only. Explicit `--hostinger` mode additionally permits only `.htaccess`, `api/contact.php`, `api/contact-lib.php` and `hostinger-build.json`.

It rejects `public_html`/WordPress paths, traversal, encoded/absolute paths, symlinks/junctions, hard-linked files, unexpected public files, common credential markers, mismatched commit/build metadata and missing pages. Its default operation is read-only and returns `uploadEnabled: false`, `promotionEnabled: false`, `approvalRequired: true`. Optional `--write-local` copies the validated payload into a new ignored local directory; it refuses replacement and checks the copied hashes. `INCOMPLETE` intentionally remains: this tool has **no executable upload or promotion mode**. Scanning for a few credential patterns is defense in depth, not proof that arbitrary secrets are absent.

Run from the repository root under Node 24:

```text
node --test hosting/hostinger/publishing/release-plan.test.cjs
node hosting/hostinger/publishing/release-plan.cjs
node hosting/hostinger/publishing/release-plan.cjs --hostinger
node hosting/hostinger/publishing/release-plan.cjs --hostinger --write-local
```

The last commands require the corresponding output directory to have been built first. They do not build, contact a host or deploy. The manifest identifies the source commit but does **not** attest that a modified worktree is that committed source. Future publishing must require a clean checkout, exact approved commit and verified candidate-change digest before creating a release. Local uncommitted POC artifacts must be labelled as such.

### Executed POC tests

`node --test hosting/hostinger/publishing/release-plan.test.cjs`: **12 passed, 0 failed, 0 skipped**, Node 24.16.0. Includes actual Windows directory-junction rejection, disabled upload/promotion flags, exact permitted PHP overlay, credential-marker rejection, missing/invalid build rejection, immutable local write and source-mutation rejection. These tests are local fixtures; they do not establish remote server behavior or a tamper-proof deployment system.

## Future automated deployment proposal — disabled and approval gated

1. Leave all existing CMS/editor publishing rules and section restrictions intact. Ordinary editors save to `content`; a named owner/reviewer checks and approves the content PR. Current independent review enforcement is **not verified/enforced**; a `main` commit alone is insufficient evidence of human approval.
2. Before enabling automation, reconcile branch policy and require a recorded reviewer approval for the **exact head SHA**. In a private repository without enforceable approval controls, retain a manual owner approval gate; do not call it platform enforcement. Reject unreviewed pushes, bot/self approvals and approvals for stale commits. Non-content changes require a separately reviewed change. No `pull_request_target` job may execute PR-controlled scripts with deployment credentials.
3. Use Node 24 and `npm ci`, `npm run check`, `npm test`, `npm run verify`, then the reviewed Hostinger builder and local package safety tests. Build a clean detached checkout of the approved `main` SHA. Do not override it with a branch-tip checkout during deployment. Never execute build scripts on Hostinger merely by connecting Git.
4. Verify GitHub Actions included allowance, spending controls and Actions artifact limits **before** enabling a job. A paid private-repository runner allowance cannot be assumed. No automation should start if the no-charge condition cannot be demonstrated. Locally building/transferring on the owner's existing computer avoids GitHub build-minute charges, but is an owner-triggered process and does not provide unattended continuous publishing while that computer is off. A future local watcher/self-hosted runner would need separate security/operation approval and a dedicated least-privilege environment; none has been installed.
5. Use minimal `contents: read` permission for build/deploy jobs and no broad PAT. Pin every external action to reviewed immutable commit SHAs. Restrict deployment to the same repository, `refs/heads/main`, explicit approved SHA and the correct environment. Serialize production releases (`concurrency`, cancel-in-progress **false**); re-check remote current release and expected predecessor under an exclusive lock. If another release wins or the approved SHA is superseded, stop and obtain a new decision. Fail closed on missing/ambiguous review evidence.
6. Transfer only a new immutable release directory to an explicitly approved non-public staging path, proposed shape `/home/u<account>/ip3-static-releases/<40-character-sha>`. The exact provider path and ability to keep it outside the served root must be inspected later. Never use `public_html` as a generic upload root, never use `rsync --delete`, and never copy or move WordPress files. Refuse existing release paths and validate canonical real paths remotely before any future write. Remote code must separately reject symlinks and path escapes; the local checker does not establish remote path safety.
7. Recompute every uploaded file hash on the server and compare **exact file set, sizes and hashes**. Verify disk and inode allowance before upload; abort without cleanup of unrelated directories when limits are insufficient. No website promotion occurs after a partial upload or failed check. Retaining generated releases is not a Hostinger backup operation and does not copy WordPress/database/media, but using any server storage still requires an explicitly approved remote preparation.
8. **Promotion remains unimplemented.** Before a live migration, choose and test a supported no-symlink routing strategy in a separately approved non-public environment. Candidate: a dedicated future static document root with immutable `_ip3_releases/<sha>` directories and one server-side routing selector replaced by a same-directory atomic file rename. Reject direct browser access to release paths while allowing internal rewrites, preserve clean URLs, query redirects, PHP endpoint and custom 404. Prove LiteSpeed semantics and same-filesystem rename behavior first. No selector may be installed into or rewrite the existing WordPress root during this POC. Moving/replacing WordPress `public_html`, reassigning a document root or enabling symlinks is not authorized and is not a tested fallback.
9. After separately authorized activation, verify `/build.json`, correct content SHA, all pages and selected assets, response/security headers, redirects, 404, TLS, contact challenge/validation/delivery and mobile behavior. A failed smoke test blocks subsequent releases and uses the approved rollback below. Do not delete earlier releases automatically.

## Credentials and server trust

- No SSH keys or secrets have been generated, retrieved or stored for this POC. Never place credentials in Pages CMS, JSON, Git, generated output or public PHP files.
- Use a dedicated deploy key scoped to the future static release area where the provider permits it. A shared hosting account key may expose all websites and mail-adjacent files; if Hostinger cannot constrain it, document that residual risk and require owner approval. Prefer a restricted SFTP account/forced command where supported; do not assume support.
- Future CI secrets belong in a tightly scoped GitHub deployment environment, not PR jobs. Private-repository environment reviewer availability must be checked before claiming approval enforcement. Logs must not echo passwords, SMTP keys, challenge secrets or private paths containing credentials. Use provider-managed secret storage/private files outside every web root with restrictive permissions for PHP contact settings.
- Verify the SSH server's SHA-256 host-key fingerprint through an independent trusted hPanel/provider-support channel. A raw `ssh-keyscan` output is **not** identity verification. Pin the verified host/port in `known_hosts`, require `StrictHostKeyChecking=yes`, and stop on a changed key. Never set it to `no`, never accept first-use prompts automatically and never disable TLS verification.
- Use SFTP/SSH, not plaintext FTP. Review `authorized_keys` restrictions and actual PHP/server file permissions before any remote test. No port, firewall, SSH setting, permission or billing change is authorized now.

## Rollback and retention

For the **future static website only**, retain at least the previous two known-good generated releases and their manifests within the already-included free storage/inode limits. This is release retention, not a copy/export/restore of existing WordPress. No retention operation has run remotely. Do not automatically delete old directories; a later approved cleanup must enumerate exact release IDs, verify none is active/in use, and never walk upward to a domain root.

The proposed rollback is to validate the prior release manifest and switch the static-only routing selector to that exact reviewed SHA, followed by full smoke checks. No database rollback is needed for static editorial content. This mechanism is **unverified** until an approved isolated server test proves it. It does not establish safe initial WordPress cutover recovery. Existing WordPress recovery protection remains **PENDING OWNER DECISION — NO BACKUP AUTHORIZED**; do not create/download/restore/copy a backup or treat provider's dated listing as verified recoverability.

## Zero-additional-cost status and remote gates

Target incremental cost: **$0** using the already-paid Business plan, current Pages CMS/GitHub account and existing computer. This is a conditional architecture estimate, not a purchase or proof of remaining CI/storage/mail allowance. No new paid service, trial, backup or subscription is required by the local POC.

Remaining gates: live account SSH/SFTP scope, exact limits, secure secret storage, host fingerprint, no-charge build execution, independent review policy, tested no-symlink promotion/rollback, contact delivery, staff CMS acceptance and initial WordPress recovery protection. Do not push a feature branch while automatic Vercel previews and Hobby commercial-use eligibility remain unresolved. Do not connect a Git integration to the live WordPress website. No DNS, email or cross-domain redirects are part of this package.

## Primary references checked 17 October 2026

- [Hostinger supported file-transfer and server-access options](https://www.hostinger.com/support/which-file-transfer-and-server-access-options-are-supported-at-hostinger/) — documents SFTP and rsync on eligible plans, LiteSpeed/.htaccess, default-disabled symlinks, no shared-plan vhosts. This supports capability investigation, not account-specific activation.
- [Hostinger Git deployment](https://www.hostinger.com/support/1583302-how-to-deploy-a-git-repository-in-hostinger/) — provider Git integration exists for PHP/HTML websites; it is not evidence of the IP3 Node build/review/rollback workflow working. We have not connected it.
- [Hostinger symlink behavior](https://www.hostinger.com/support/1583694-how-to-create-a-symlink-at-hostinger/) — no symlink switching assumption.

No account limit, remote approval control, runtime deployment or email delivery is marked passed solely from these documents.
