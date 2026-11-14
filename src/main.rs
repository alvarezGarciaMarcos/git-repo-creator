mod config;
mod providers;

use anyhow::{bail, Context, Result};
use clap::{Args, Parser, Subcommand};
use dialoguer::{theme::ColorfulTheme, Confirm, Input, Select};
use std::io::IsTerminal;
use std::path::Path;
use std::process::Command;

use config::{RepoConfig, Store};
use providers::{NewRepo, Provider};

/// A tool for creating remote git repositories right from your command line
#[derive(Parser)]
#[command(name = "git-repo-creator", version)]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
}

#[derive(Subcommand)]
enum Cmd {
    /// Setup a Bitbucket account
    #[command(name = "config:bitbucket")]
    ConfigBitbucket(ConfigArgs),
    /// Setup a github account
    #[command(name = "config:github")]
    ConfigGithub(ConfigArgs),
    /// Setup a Gitlab account
    #[command(name = "config:gitlab")]
    ConfigGitlab(ConfigArgs),
    /// Create a new Bitbucket remote repository
    #[command(name = "create:bitbucket")]
    CreateBitbucket(CreateArgs),
    /// Create a new Github remote repository
    #[command(name = "create:github")]
    CreateGithub(CreateArgs),
    /// Create a new Gitlab remote repository
    #[command(name = "create:gitlab")]
    CreateGitlab(CreateArgs),
}

#[derive(Args)]
struct ConfigArgs {
    #[arg(short = 'k', long = "apiKey")]
    api_key: Option<String>,
    #[arg(short = 'u', long)]
    username: Option<String>,
    /// Print the stored configuration
    #[arg(long)]
    read: bool,
    /// Delete the stored configuration and ask again
    #[arg(long)]
    reset: bool,
}

#[derive(Args)]
struct CreateArgs {
    #[arg(value_name = "REPONAME")]
    repo_name: String,
    /// Change the visibility of the repository to 'public'
    #[arg(short = 'p', long)]
    public: bool,
    /// Repository description (skips the description prompt)
    #[arg(short = 'd', long)]
    description: Option<String>,
    /// Do not clone/add remote of the new repository
    #[arg(long = "noClone", visible_alias = "no-clone")]
    no_clone: bool,
    /// Clone using ssh
    #[arg(long, conflicts_with_all = ["no_clone", "http"])]
    ssh: bool,
    /// Clone using http
    #[arg(long, conflicts_with_all = ["no_clone", "ssh"])]
    http: bool,
}

fn main() {
    let cli = Cli::parse();
    let result = match cli.cmd {
        Cmd::ConfigBitbucket(a) => run_config(Provider::Bitbucket, a),
        Cmd::ConfigGithub(a) => run_config(Provider::Github, a),
        Cmd::ConfigGitlab(a) => run_config(Provider::Gitlab, a),
        Cmd::CreateBitbucket(a) => run_create(Provider::Bitbucket, a),
        Cmd::CreateGithub(a) => run_create(Provider::Github, a),
        Cmd::CreateGitlab(a) => run_create(Provider::Gitlab, a),
    };
    if let Err(e) = result {
        eprintln!("Error: {e:#}");
        std::process::exit(1);
    }
}

fn interactive() -> bool {
    std::io::stdin().is_terminal() && std::io::stderr().is_terminal()
}

// ---------------------------------------------------------------- config:*

fn run_config(p: Provider, a: ConfigArgs) -> Result<()> {
    let store = Store::open_default()?;
    let current = store.load()?.get(p).clone();

    if a.reset {
        store.update(p, RepoConfig::default())?;
        prompt_credentials(p, &store)?;
    } else if a.username.is_some() || a.api_key.is_some() {
        let new = RepoConfig {
            username: a.username.or(current.username),
            api_key: a.api_key.or(current.api_key),
        };
        store.update(p, new)?;
    } else if a.read || current.api_key.is_some() {
        // just print
    } else {
        prompt_credentials(p, &store)?;
    }
    print_configuration(p, store.load()?.get(p));
    Ok(())
}

fn prompt_credentials(p: Provider, store: &Store) -> Result<()> {
    if !interactive() {
        bail!("no terminal to prompt on; pass --username and --apiKey instead");
    }
    let theme = ColorfulTheme::default();
    let username: String = Input::with_theme(&theme)
        .with_prompt(format!("What is your {} username?", p.display_name()))
        .interact_text()?;
    let api_key: String = dialoguer::Password::with_theme(&theme)
        .with_prompt(format!(
            "What is your {} personal authorization token?",
            p.display_name()
        ))
        .interact()?;
    store.update(
        p,
        RepoConfig {
            username: Some(username),
            api_key: Some(api_key),
        },
    )
}

fn mask(secret: &str) -> String {
    let n = secret.chars().count();
    if n <= 8 {
        "*".repeat(n)
    } else {
        let tail: String = secret.chars().skip(n - 4).collect();
        format!("{}{tail}", "*".repeat(n - 4))
    }
}

fn print_configuration(p: Provider, c: &RepoConfig) {
    let rows = [
        ("Repository provider", p.display_name().to_string()),
        ("Username", c.username.clone().unwrap_or_default()),
        ("ApiKey", c.api_key.as_deref().map(mask).unwrap_or_default()),
    ];
    let w0 = rows.iter().map(|r| r.0.chars().count()).max().unwrap_or(0) + 2;
    let w1 = rows.iter().map(|r| r.1.chars().count()).max().unwrap_or(0) + 2;
    let line = |l: &str, m: &str, r: &str| format!("{l}{}{m}{}{r}", "─".repeat(w0), "─".repeat(w1));
    println!("{}", line("┌", "┬", "┐"));
    for (i, (k, v)) in rows.iter().enumerate() {
        println!("│ {k:<a$} │ {v:<b$} │", a = w0 - 2, b = w1 - 2);
        if i + 1 < rows.len() {
            println!("{}", line("├", "┼", "┤"));
        }
    }
    println!("{}", line("└", "┴", "┘"));
}

// ---------------------------------------------------------------- create:*

fn run_create(p: Provider, a: CreateArgs) -> Result<()> {
    let store = Store::open_default()?;
    let cfg = store.load()?.get(p).clone();
    if !cfg.is_complete() {
        bail!(
            "You have to setup your account first: git-repo-creator config:{}",
            p.display_name().to_lowercase()
        );
    }

    let description = match a.description {
        Some(d) => d,
        None => prompt_description()?,
    };
    let created = providers::create_repo(
        p,
        &cfg,
        &NewRepo {
            name: &a.repo_name,
            description: &description,
            public: a.public,
        },
    )?;

    if a.no_clone {
        println!("Your repository is ready!!");
        println!(
            "  https: {}\n  ssh:   {}",
            created.https_url, created.ssh_url
        );
        return Ok(());
    }

    let url = if choose_ssh(a.ssh, a.http)? {
        &created.ssh_url
    } else {
        &created.https_url
    };

    if Path::new(".git").exists() {
        add_remote(url)?;
        println!("Your repo is ready and the origin has been set!!");
    } else {
        let status = git(&["clone", url, &a.repo_name])?;
        if !status {
            println!("Your repository has been created, but the cloning process has failed. Please try to clone it manually");
            println!("This is the url of the new repo: {url}");
            return Ok(());
        }
        println!("Your repository is ready!!");
    }
    Ok(())
}

fn prompt_description() -> Result<String> {
    if !interactive() {
        return Ok(String::new());
    }
    let theme = ColorfulTheme::default();
    if Confirm::with_theme(&theme)
        .with_prompt("Do you want to add a description?")
        .default(false)
        .interact()?
    {
        Ok(Input::with_theme(&theme)
            .with_prompt("Description")
            .allow_empty(true)
            .interact_text()?)
    } else {
        Ok(String::new())
    }
}

fn choose_ssh(ssh: bool, http: bool) -> Result<bool> {
    if ssh || http {
        return Ok(ssh);
    }
    if !interactive() {
        return Ok(true); // same default as the prompt's initial selection
    }
    let i = Select::with_theme(&ColorfulTheme::default())
        .with_prompt("How do you want your repository?")
        .items(&["ssh", "https"])
        .default(0)
        .interact()?;
    Ok(i == 0)
}

/// Runs git with an argument vector (no shell, so repository names can't inject commands).
fn git(args: &[&str]) -> Result<bool> {
    let status = Command::new("git")
        .args(args)
        .status()
        .context("Sorry, this tool needs git installed and on your PATH")?;
    Ok(status.success())
}

fn add_remote(url: &str) -> Result<()> {
    let has_origin = Command::new("git")
        .args(["remote", "get-url", "origin"])
        .output()
        .context("Sorry, this tool needs git installed and on your PATH")?
        .status
        .success();
    let ok = if has_origin {
        git(&["remote", "set-url", "origin", url])?
    } else {
        git(&["remote", "add", "origin", url])?
    };
    if !ok {
        bail!("the repository was created but setting the origin remote failed; URL: {url}");
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn masks_tokens() {
        assert_eq!(mask("ghp_abcdefgh1234"), "************1234");
        assert_eq!(mask("short"), "*****");
    }

    #[test]
    fn cli_definition_is_valid() {
        use clap::CommandFactory;
        Cli::command().debug_assert();
    }

    #[test]
    fn ssh_and_noclone_conflict() {
        assert!(Cli::try_parse_from(["x", "create:github", "r", "--ssh", "--noClone"]).is_err());
        assert!(Cli::try_parse_from(["x", "create:github", "r", "--ssh", "--http"]).is_err());
        assert!(Cli::try_parse_from(["x", "create:github", "r", "--no-clone", "-p"]).is_ok());
    }
}
