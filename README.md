# git-repo-creator

Create a remote Git repository on GitHub, GitLab or Bitbucket from your terminal, then
clone it (or set it as `origin` if you're already inside a Git repository).

## Install

```sh
cargo install --path .
```

Or build a binary with `cargo build --release` (output: `target/release/git-repo-creator`).
Requires `git` on your `PATH`.

## Usage

Save credentials once per provider (username + personal access token):

```sh
git-repo-creator config:github                     # interactive
git-repo-creator config:github -u me -k <token>    # non-interactive
git-repo-creator config:github --read              # show (token masked)
git-repo-creator config:github --reset             # clear and ask again
```

Create a repository:

```sh
git-repo-creator create:github my-repo                  # private; asks for description and ssh/https
git-repo-creator create:gitlab my-repo -p --ssh -d "My project"
git-repo-creator create:bitbucket my-repo --noClone
```

| Flag | Meaning |
|---|---|
| `-p`, `--public` | Create a public repository (default: private) |
| `-d`, `--description` | Description (skips the prompt) |
| `--ssh` / `--http` | Clone / set remote using SSH or HTTPS (default: ask; `ssh` without a terminal) |
| `--noClone` | Only create the remote repository and print its URLs |

After creation:
- Inside a Git repository, `origin` is added (or updated) to point to the new repository.
- Otherwise, the repository is cloned into a folder named after it.

## Configuration

Credentials are stored in `~/.config/git-repo-creator/config.json`
(`$XDG_CONFIG_HOME` is honoured; `%LOCALAPPDATA%` on Windows) with `0600` permissions.
Override the location with `GIT_REPO_CREATOR_CONFIG_DIR`.

For GitHub Enterprise or self-hosted GitLab, override the API root:

```sh
export GIT_REPO_CREATOR_GITHUB_API=https://github.example.com/api/v3
export GIT_REPO_CREATOR_GITLAB_API=https://gitlab.example.com/api/v4
export GIT_REPO_CREATOR_BITBUCKET_API=https://api.bitbucket.org/2.0
```

## Personal access tokens
- [GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (needs the `repo` scope)
- [GitLab](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) (needs the `api` scope)
- [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/)

## Development

```sh
cargo test
cargo clippy -- -D warnings
```

## License
MIT
