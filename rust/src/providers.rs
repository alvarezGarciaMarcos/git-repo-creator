//! Hosting provider API clients (GitHub, GitLab, Bitbucket).

use anyhow::{anyhow, bail, Result};
use serde_json::{json, Value};
use std::time::Duration;

use crate::config::RepoConfig;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Provider {
    Github,
    Gitlab,
    Bitbucket,
}

impl Provider {
    pub fn display_name(self) -> &'static str {
        match self {
            Provider::Github => "Github",
            Provider::Gitlab => "Gitlab",
            Provider::Bitbucket => "Bitbucket",
        }
    }

    /// API root. Overridable with e.g. `GIT_REPO_CREATOR_GITLAB_API=https://gitlab.example.com/api/v4`
    /// so self-hosted GitLab / GitHub Enterprise work too.
    fn api_base(self) -> String {
        let (var, default) = match self {
            Provider::Github => ("GIT_REPO_CREATOR_GITHUB_API", "https://api.github.com"),
            Provider::Gitlab => ("GIT_REPO_CREATOR_GITLAB_API", "https://gitlab.com/api/v4"),
            Provider::Bitbucket => ("GIT_REPO_CREATOR_BITBUCKET_API", "https://api.bitbucket.org/2.0"),
        };
        std::env::var(var)
            .ok()
            .filter(|v| !v.is_empty())
            .unwrap_or_else(|| default.to_string())
            .trim_end_matches('/')
            .to_string()
    }
}

pub struct NewRepo<'a> {
    pub name: &'a str,
    pub description: &'a str,
    pub public: bool,
}

#[derive(Debug, PartialEq)]
pub struct CreatedRepo {
    pub https_url: String,
    pub ssh_url: String,
}

fn agent() -> ureq::Agent {
    ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(30))
        .user_agent(concat!("git-repo-creator/", env!("CARGO_PKG_VERSION")))
        .build()
}

fn basic_auth(user: &str, pass: &str) -> String {
    // Tiny base64 encoder to avoid pulling in a crate for one header.
    const T: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let input = format!("{user}:{pass}");
    let mut out = String::with_capacity(input.len().div_ceil(3) * 4);
    for chunk in input.as_bytes().chunks(3) {
        let b = [chunk[0], *chunk.get(1).unwrap_or(&0), *chunk.get(2).unwrap_or(&0)];
        let n = (u32::from(b[0]) << 16) | (u32::from(b[1]) << 8) | u32::from(b[2]);
        for i in 0..4 {
            if i <= chunk.len() {
                out.push(T[((n >> (18 - 6 * i)) & 63) as usize] as char);
            } else {
                out.push('=');
            }
        }
    }
    format!("Basic {out}")
}

pub fn create_repo(provider: Provider, cfg: &RepoConfig, repo: &NewRepo) -> Result<CreatedRepo> {
    let (Some(user), Some(token)) = (cfg.username.as_deref(), cfg.api_key.as_deref()) else {
        bail!(
            "You have to setup your account first: git-repo-creator config:{}",
            provider.display_name().to_lowercase()
        );
    };
    let base = provider.api_base();
    let a = agent();

    let req = match provider {
        Provider::Github => a
            .post(&format!("{base}/user/repos"))
            .set("Authorization", &basic_auth(user, token))
            .set("Accept", "application/vnd.github+json"),
        Provider::Gitlab => a
            .post(&format!("{base}/projects"))
            .set("PRIVATE-TOKEN", token),
        Provider::Bitbucket => a
            .post(&format!("{base}/repositories/{user}/{}", repo.name.to_lowercase()))
            .set("Authorization", &basic_auth(user, token)),
    };
    let body = request_body(provider, repo);

    match req.send_json(body) {
        Ok(resp) => {
            let v: Value = resp.into_json()?;
            parse_success(provider, &v)
        }
        Err(ureq::Error::Status(code, resp)) => {
            let text = resp.into_string().unwrap_or_default();
            let v: Value = serde_json::from_str(&text).unwrap_or(Value::Null);
            Err(anyhow!(
                "{} refused to create the repository (HTTP {code}): {}",
                provider.display_name(),
                error_message(provider, &v).unwrap_or_else(|| text.trim().to_string())
            ))
        }
        Err(e) => Err(anyhow!("could not reach {}: {e}", provider.display_name())),
    }
}

fn request_body(provider: Provider, r: &NewRepo) -> Value {
    match provider {
        Provider::Github => json!({ "name": r.name, "private": !r.public, "description": r.description }),
        Provider::Gitlab => json!({
            "name": r.name,
            "visibility": if r.public { "public" } else { "private" },
            "description": r.description,
        }),
        Provider::Bitbucket => json!({
            "scm": "git",
            "name": r.name,
            "is_private": !r.public,
            "description": r.description,
        }),
    }
}

fn parse_success(provider: Provider, v: &Value) -> Result<CreatedRepo> {
    let s = |p: &str| v.pointer(p).and_then(Value::as_str).map(str::to_string);
    let urls = match provider {
        Provider::Github => (s("/clone_url"), s("/ssh_url")),
        Provider::Gitlab => (s("/http_url_to_repo"), s("/ssh_url_to_repo")),
        Provider::Bitbucket => {
            let links = v.pointer("/links/clone").and_then(Value::as_array);
            let find = |name: &str| {
                links?
                    .iter()
                    .find(|l| l["name"] == name)
                    .and_then(|l| l["href"].as_str())
                    .map(str::to_string)
            };
            (find("https"), find("ssh"))
        }
    };
    match urls {
        (Some(https_url), Some(ssh_url)) => Ok(CreatedRepo { https_url, ssh_url }),
        _ => bail!("unexpected response from {}: {v}", provider.display_name()),
    }
}

/// Extracts a human-readable message from each provider's error format.
fn error_message(provider: Provider, v: &Value) -> Option<String> {
    let join = |m: &serde_json::Map<String, Value>| {
        m.iter()
            .map(|(k, val)| match val {
                Value::Array(a) => format!(
                    "{k} {}",
                    a.iter().filter_map(Value::as_str).collect::<Vec<_>>().join(", ")
                ),
                other => format!("{k} {}", other.as_str().map(str::to_string).unwrap_or(other.to_string())),
            })
            .collect::<Vec<_>>()
            .join("; ")
    };
    match provider {
        Provider::Github => v
            .pointer("/errors/0/message")
            .and_then(Value::as_str)
            .or_else(|| v["message"].as_str())
            .map(str::to_string),
        Provider::Gitlab => match &v["message"] {
            Value::String(s) => Some(s.clone()),
            Value::Object(m) => Some(join(m)),
            _ => v["error_description"].as_str().or(v["error"].as_str()).map(str::to_string),
        },
        Provider::Bitbucket => v.pointer("/error/message").and_then(Value::as_str).map(str::to_string),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn base64_matches_reference() {
        assert_eq!(basic_auth("Aladdin", "open sesame"), "Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==");
        assert_eq!(basic_auth("a", "b"), "Basic YTpi");
        assert_eq!(basic_auth("ab", "c"), "Basic YWI6Yw==");
    }

    #[test]
    fn parses_error_shapes() {
        let gh = json!({"message":"Repository creation failed.","errors":[{"message":"name already exists on this account"}]});
        assert_eq!(error_message(Provider::Github, &gh).unwrap(), "name already exists on this account");
        // 401 has no `errors` array — the TS version crashed with a TypeError here.
        let gh401 = json!({"message":"Bad credentials"});
        assert_eq!(error_message(Provider::Github, &gh401).unwrap(), "Bad credentials");
        let gl = json!({"message":{"name":["has already been taken"],"path":["has already been taken"]}});
        assert_eq!(
            error_message(Provider::Gitlab, &gl).unwrap(),
            "name has already been taken; path has already been taken"
        );
        let gl401 = json!({"message":"401 Unauthorized"});
        assert_eq!(error_message(Provider::Gitlab, &gl401).unwrap(), "401 Unauthorized");
        let bb = json!({"type":"error","error":{"message":"Repository with this Slug and Owner already exists."}});
        assert!(error_message(Provider::Bitbucket, &bb).unwrap().contains("already exists"));
    }

    #[test]
    fn bitbucket_links_matched_by_name_not_position() {
        let v = json!({"links":{"clone":[
            {"name":"ssh","href":"git@bitbucket.org:u/r.git"},
            {"name":"https","href":"https://u@bitbucket.org/u/r.git"}]}});
        let r = parse_success(Provider::Bitbucket, &v).unwrap();
        assert_eq!(r.ssh_url, "git@bitbucket.org:u/r.git");
        assert_eq!(r.https_url, "https://u@bitbucket.org/u/r.git");
    }
}
