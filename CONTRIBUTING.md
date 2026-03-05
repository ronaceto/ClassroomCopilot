# Contributing

Thanks for contributing to Classroom Copilot.

## Branch Sync Checklist (Required Before Opening/Updating a PR)

This repository has a few files that are frequent merge-conflict hotspots:

- `README.md`
- `netlify/functions/chat.js`
- `src/App.tsx`
- `src/hooks/useChat.ts`

Before opening/updating a PR, run the following steps to reduce conflict churn:

1. Fetch latest changes.
2. Rebase (or merge) your branch on top of the current base branch.
3. Resolve conflicts locally.
4. Build locally.
5. Push the updated branch.

### Recommended commands

```bash
git fetch origin
git rebase origin/<base-branch>
# resolve conflicts if prompted
npm run build
git add README.md netlify/functions/chat.js src/App.tsx src/hooks/useChat.ts
git rebase --continue
git push --force-with-lease
```

If your team uses merge commits instead of rebase:

```bash
git fetch origin
git merge origin/<base-branch>
# resolve conflicts if prompted
npm run build
git add README.md netlify/functions/chat.js src/App.tsx src/hooks/useChat.ts
git commit
git push
```

## Deployment Notes

If production still shows old behavior after merge/conflict resolution:

- Trigger **Clear cache and deploy site** in Netlify.
- Verify `OPENAI_API_KEY` is present.
- Check API Debug panel + Netlify function logs for `functionVersion`.
