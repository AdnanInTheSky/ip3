# Main branch protection

After the first successful `Content check` run appears in GitHub, an owner must confirm the exact check-run name with this read-only command (replace `<sha>` with the commit SHA from that run):

```powershell
gh api repos/mdsyfulhoque-afk/ip3-bd.org/commits/<sha>/check-runs --jq '.check_runs[].name'
```

The workflow explicitly names its required job `check`; the branch policy uses the `check` context. Do not apply the policy until the command above returns `check` for the successful run.

From the repository root, the owner can apply [branch-protection.json](branch-protection.json) with this command:

```powershell
gh api --method PUT --header "Accept: application/vnd.github+json" repos/mdsyfulhoque-afk/ip3-bd.org/branches/main/protection --input docs/branch-protection.json
```

The policy requires pull requests and the successful `check` status, uses strict up-to-date checks, allows an owner-only merge without a second approving account, and prevents force-pushes or branch deletion. `enforce_admins` is false to avoid locking the single owner out; the owner remains accountable for review. The `content` branch remains writable by named editors; protect `main` as the production merge target. This command has not been run.
