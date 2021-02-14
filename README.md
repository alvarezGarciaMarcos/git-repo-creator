git-repo-creator
================

A tool for creating remote GIT repositories

With git-repo-creator you can create a remote repository directly from your terminal! It is compatible with GitHub, Gitlab, and Bitbucket. It also allows to use HTTPS or SSH repositories.


<!-- toc -->
* [Installation](#installation)
* [Commands](#commands)
* [Flags](#flags)
* [Useful Links](#useful-links)
<!-- tocstop -->

## Installation
<!-- installation -->
```sh-session
$ npm install -g git-repo-creator
```
<!-- installationstop -->

## After creation
When a repository is sucessfully created, two things might happen:
- If the command is executed inside a folder containing a local git repository, a new remote will be updated/added with the new one.
- If the command is executed outside of a local git repository, a new folder (named after the repository) will be created, containing the new repo.

## Example Usage
As a test, I am going to show you how to setup a GitHub account inside the tool, and how to create a remote repository:

First of all, we have to setup our credentials:
```
git-repo-creator config:github
```
This will launch a simple assistant that will ask you about your username and personal access token (for more info about this please refer to the [bottom section](#useful-links))

Setup is done! Now, let's create our repository.


```
git-repo-creator create:github simple-test
```
When this command is entered, the tool will ask you if you want to add a description as well as whether you want your repository to be cloned as an SSH or HTTPS.


## Commands
<!-- commands -->
* [`git-repo-creator config:COMMAND`](#git-repo-creator-configcommand)
* [`git-repo-creator create [REPONAME]`](#git-repo-creator-create-reponame)

<!-- configCommand -->
### `git-repo-creator config:COMMAND`

Sets up the credentials to the different git providers.

```
USAGE
  $ git-repo-creator config:COMMAND

COMMANDS
  config:bitbucket  Setup a Bitbucket account
  config:github     Setup a github account
  config:gitlab     Setup a Gitlab accountt
```
<!-- configCommandstop -->

### `git-repo-creator create [REPONAME]`

Create a new remote repository

```
USAGE
  $ git-repo-creator create [REPONAME]

OPTIONS
  -h, --help       show CLI help
  -n, --name=name  name of the created repo
  --github
```

<!-- commandsstop -->

<!-- flags -->
## Flags
- `--ssh` to clone the repo using ssh
- `--http` to clone the repo using http (default)
- `--noClone` to not clone nor add the origin of the new created repository
- `-p`, `--public` to create a public repository (defaults to private)
<!-- flagsstop -->

<!-- useful-links -->
## Useful Links
- [Personal Access Token (GitLab)](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
- [Peronal Access Token (GitHub)]()
- [Peronal Access Token (BitBucket)]()
<!-- useful-linksstop -->