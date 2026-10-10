# Main branch protection

After the first successful `Content check` run appears in GitHub, an owner should confirm the check context shown by GitHub Actions. The expected context for workflow `Content check` and job `check` is `Content check / check`.

From the repository root, the owner can apply [branch-protection.json](branch-protection.json) with this command:

```powershell
gh api --method PUT --header "Accept: application/vnd.github+json" repos/mdsyfulhoque-afk/ip3-bd.org/branches/main/protection --input docs/branch-protection.json
```

The policy requires pull requests, one approval, the successful content check, and prevents force-pushes or branch deletion. The `content` branch remains writable by named editors; protect `main` as the only production merge target. This command has not been run.
