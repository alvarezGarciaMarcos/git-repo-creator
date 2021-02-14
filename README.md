git-repo-creator
================

A tool for creating remote GIT repositories

With git-repo-creator you can create a remote repository directly from your terminal! It is compatible with GitHub, Gitlab, and Bitbucket. It also allows to use HTTPS or SSH repositories.


<!-- toc -->

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
* [`git-repo-creator config:bitbucket`](#git-repo-creator-configbitbucket)
* [`git-repo-creator config:github`](#git-repo-creator-configgithub)
* [`git-repo-creator config:gitlab`](#git-repo-creator-configgitlab)
* [`git-repo-creator create:bitbucket REPONAME`](#git-repo-creator-createbitbucket-reponame)
* [`git-repo-creator create:github REPONAME`](#git-repo-creator-creategithub-reponame)
* [`git-repo-creator create:gitlab REPONAME`](#git-repo-creator-creategitlab-reponame)
* [`git-repo-creator help [COMMAND]`](#git-repo-creator-help-command)

## `git-repo-creator config:bitbucket`

Setup a Bitbucket account

```
USAGE
  $ git-repo-creator config:bitbucket

OPTIONS
  -h, --help               show CLI help
  -k, --apiKey=apiKey
  -u, --username=username
  --read
  --reset
```

_See code: [src/commands/config/bitbucket.ts](https://github.com/alvarezGarciaMarcos/git-repo-creator/blob/v1.0.0/src/commands/config/bitbucket.ts)_

## `git-repo-creator config:github`

Setup a github account

```
USAGE
  $ git-repo-creator config:github

OPTIONS
  -h, --help               show CLI help
  -k, --apiKey=apiKey
  -u, --username=username
  --read
  --reset
```

_See code: [src/commands/config/github.ts](https://github.com/alvarezGarciaMarcos/git-repo-creator/blob/v1.0.0/src/commands/config/github.ts)_

## `git-repo-creator config:gitlab`

Setup a Gitlab account

```
USAGE
  $ git-repo-creator config:gitlab

OPTIONS
  -h, --help               show CLI help
  -k, --apiKey=apiKey
  -u, --username=username
  --read
  --reset
```

_See code: [src/commands/config/gitlab.ts](https://github.com/alvarezGarciaMarcos/git-repo-creator/blob/v1.0.0/src/commands/config/gitlab.ts)_

## `git-repo-creator create:bitbucket REPONAME`

Create a new Bitbucket remote repository

```
USAGE
  $ git-repo-creator create:bitbucket REPONAME

OPTIONS
  -h, --help    show CLI help
  -p, --public  Change the visibility of the repository to 'public'
  --http        Clone using http
  --noClone     Do not clone/add remote of the new repository
  --ssh         Clone using ssh
```

_See code: [src/commands/create/bitbucket.ts](https://github.com/alvarezGarciaMarcos/git-repo-creator/blob/v1.0.0/src/commands/create/bitbucket.ts)_

## `git-repo-creator create:github REPONAME`

Create a new Github remote repository

```
USAGE
  $ git-repo-creator create:github REPONAME

OPTIONS
  -h, --help    show CLI help
  -p, --public  Change the visibility of the repository to 'public'
  --http        Clone using http
  --noClone     Do not clone/add remote of the new repository
  --ssh         Clone using ssh
```

_See code: [src/commands/create/github.ts](https://github.com/alvarezGarciaMarcos/git-repo-creator/blob/v1.0.0/src/commands/create/github.ts)_

## `git-repo-creator create:gitlab REPONAME`

Create a new Gitlab remote repository

```
USAGE
  $ git-repo-creator create:gitlab REPONAME

OPTIONS
  -h, --help    show CLI help
  -p, --public  Change the visibility of the repository to 'public'
  --http        Clone using http
  --noClone     Do not clone/add remote of the new repository
  --ssh         Clone using ssh
```

_See code: [src/commands/create/gitlab.ts](https://github.com/alvarezGarciaMarcos/git-repo-creator/blob/v1.0.0/src/commands/create/gitlab.ts)_

## `git-repo-creator help [COMMAND]`

display help for git-repo-creator

```
USAGE
  $ git-repo-creator help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_
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
- [Personal Access Token (GitHub)](https://docs.github.com/es/github/authenticating-to-github/creating-a-personal-access-token)
- [Personal Access Token (BitBucket)](https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html)
<!-- useful-linksstop -->
