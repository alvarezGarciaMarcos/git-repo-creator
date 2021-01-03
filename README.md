git-repo-creator
================

A tool for creating remote GIT repositories

With git-repo-creator you can create a remote repository directly from your terminal! It is compatible with GitHub, Gitlab, and Bitbucket. It also allows to use HTTPS or SSH repositories.

<!-- toc -->
* [Installation](#installation)
* [Commands](#commands)
<!-- tocstop -->

# Installation
<!-- installation -->
```sh-session
$ npm install -g git-repo-creator
```
<!-- installationstop -->

# After creation
When a repository is sucessfully created, two things might happen:
- If the command is executed inside a local git repository, the origin remote will be updated with the new one.
- If the command is executed outside of a local git repository, a new folder (named after the repository name) will be created, and the remote repository will be cloned there.

# Example Usage
As a test, I am going to show you how to setup a GitHub account inside the tool, and how to create a remote repository:

First of all, we have to setup our credentials:
```
git-repo-creator config:github
```
This will launch a simple assistant that will ask you about your username and personal access token.

Setup is done! Now, let's create our repository.


```
git-repo-creator create:github simple-test
```
When we enter this command, the tool will ask us whether we want our repository to be cloned as an SSH or HTTPS repository.



# Commands
<!-- commands -->
* [`git-repo-creator config:COMMAND`](#git-repo-creator-configcommand)
* [`git-repo-creator create [REPONAME]`](#git-repo-creator-create-reponame)

<!-- configCommand -->
## `git-repo-creator config:COMMAND`

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

## `git-repo-creator create [REPONAME]`

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

# Useful links
- [Personal Access Token (GitLab)](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
- [Peronal Access Token (GitHub)]()
- [Peronal Access Token (BitBucket)]()