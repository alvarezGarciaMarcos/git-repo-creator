# git-repo-creator (Rust port)

A drop-in Rust rewrite of the TypeScript CLI: same commands, flags and config file
(`~/.config/git-repo-creator/config.json`), shipped as a single static binary.

```sh
cargo build --release          # target/release/git-repo-creator
cargo test
```

## Differences from the TypeScript version
- API errors are reported (with the HTTP status) and the process exits non-zero.
- `git` is run without a shell, so repository names cannot inject commands.
- `--noClone` is honoured outside a git repository too.
- Tokens are masked when printed, hidden while typed, and the config file is written atomically with `0600` permissions.
- Bitbucket sends the real description; clone links are matched by name.
- GitHub HTTPS remotes use `clone_url` (ending in `.git`).
- An existing `origin` is updated with `git remote set-url`.
- New: `-d/--description`, and `GIT_REPO_CREATOR_{GITHUB,GITLAB,BITBUCKET}_API` to target
  GitHub Enterprise / self-hosted GitLab. Without a TTY, prompts are skipped (empty description, ssh).
