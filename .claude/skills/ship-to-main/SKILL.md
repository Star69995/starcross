---
name: ship-to-main
description: Commit all pending changes on the current branch, merge that branch into main, and push both branches to origin. Use when the user asks to commit and merge/ship everything to main (e.g. "commit and merge to main and push").
---

# Ship to main

Commits whatever is pending on the current working branch, merges it into `main`, and pushes both branches to `origin`. Ends back on the branch you started from.

This pushes to shared remote branches (including `main`) — only run it when the user has explicitly asked to commit/merge/ship to main in this turn. Don't infer it from an unrelated request.

## Steps

1. **Survey the working tree.**
   - `git status`
   - `git diff --stat` (and read the actual diff for anything unfamiliar)
   - Confirm there's nothing that looks like a secret (`.env`, credentials, API keys) in the modified/untracked files. If something looks suspicious, stop and ask the user before staging it.

2. **Stage and commit.**
   - Stage the relevant files (prefer explicit paths from `git status` over `git add -A` if anything unexpected/untracked shows up that the user likely didn't intend to ship).
   - Write a commit message describing the *why*, following this repo's existing commit style (`git log --oneline -10`).
   - Commit via heredoc so formatting survives:
     ```bash
     git commit -m "$(cat <<'EOF'
     <summary line>

     <optional body>

     Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
     EOF
     )"
     ```
   - If there's nothing to commit (clean tree), skip straight to the merge — don't create an empty commit.

3. **Push the working branch.**
   - `git push origin <current-branch>`

4. **Merge into main.**
   - `git checkout main`
   - `git pull origin main`
   - `git merge <current-branch> --no-edit`
   - If the merge isn't a clean fast-forward/auto-merge (real conflicts), **stop** — don't resolve destructively (no `--theirs`/`--ours` guessing, no discarding hunks). Report the conflicting files to the user and let them decide.

5. **Push main.**
   - `git push origin main`

6. **Return to the starting branch.**
   - `git checkout <current-branch>`
   - `git status` to confirm a clean tree.

## Notes

- Never force-push, never skip hooks (`--no-verify`), never amend an existing commit as part of this flow — always a fresh commit.
- If `<current-branch>` is already `main`, skip steps 3–4/6 (nothing to merge) and just commit + push.
- If the remote rejects a push (diverged history), don't force — fetch, report the divergence to the user, and let them decide how to reconcile.
