<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Git Workflow

For this project, whenever you complete a feature or bug fix:

1. Check the changes with git status.
2. Review the diff.
3. Do not commit secrets, .env files, build files, node_modules, or temporary files.
4. Run the appropriate tests/build checks.
5. Stage the required files with git add.
6. Create a meaningful conventional commit message.
7. Commit the changes.
8. Push the commit to the current GitHub branch.

Never use git reset --hard.
Never use git push --force.
Never rewrite Git history.
If there are unrelated user changes, do not overwrite them.
