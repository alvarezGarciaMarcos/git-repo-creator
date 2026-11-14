//! Credential storage. The file layout is identical to the TypeScript (oclif) version
//! so existing users keep their configuration after upgrading:
//! `<config dir>/git-repo-creator/config.json` →
//! `{"github":{"apiKey":..,"username":..},"gitlab":{..},"bitbucket":{..}}`

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::providers::Provider;

#[derive(Debug, Default, Clone, PartialEq, Serialize, Deserialize)]
pub struct RepoConfig {
    #[serde(rename = "apiKey", default, skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub username: Option<String>,
}

impl RepoConfig {
    pub fn is_complete(&self) -> bool {
        matches!((&self.username, &self.api_key), (Some(u), Some(k)) if !u.is_empty() && !k.is_empty())
    }
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct AppConfig {
    #[serde(default)]
    pub github: RepoConfig,
    #[serde(default)]
    pub gitlab: RepoConfig,
    #[serde(default)]
    pub bitbucket: RepoConfig,
}

impl AppConfig {
    pub fn get(&self, p: Provider) -> &RepoConfig {
        match p {
            Provider::Github => &self.github,
            Provider::Gitlab => &self.gitlab,
            Provider::Bitbucket => &self.bitbucket,
        }
    }

    pub fn set(&mut self, p: Provider, c: RepoConfig) {
        match p {
            Provider::Github => self.github = c,
            Provider::Gitlab => self.gitlab = c,
            Provider::Bitbucket => self.bitbucket = c,
        }
    }
}

/// Same directory oclif v1 uses: `$XDG_CONFIG_HOME/git-repo-creator`, `~/.config/git-repo-creator`
/// on Unix (including macOS) and `%LOCALAPPDATA%\git-repo-creator` on Windows.
/// `GIT_REPO_CREATOR_CONFIG_DIR` overrides it.
pub fn config_dir() -> Result<PathBuf> {
    if let Some(d) = std::env::var_os("GIT_REPO_CREATOR_CONFIG_DIR") {
        return Ok(PathBuf::from(d));
    }
    let base = if cfg!(windows) {
        std::env::var_os("LOCALAPPDATA").map(PathBuf::from)
    } else {
        std::env::var_os("XDG_CONFIG_HOME")
            .filter(|v| !v.is_empty())
            .map(PathBuf::from)
            .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".config")))
    };
    Ok(base
        .context("could not determine the configuration directory")?
        .join("git-repo-creator"))
}

pub struct Store {
    path: PathBuf,
}

impl Store {
    pub fn open_default() -> Result<Self> {
        Ok(Self::at(config_dir()?.join("config.json")))
    }

    pub fn at(path: impl Into<PathBuf>) -> Self {
        Self { path: path.into() }
    }

    #[cfg(test)]
    pub fn path(&self) -> &std::path::Path {
        &self.path
    }

    pub fn load(&self) -> Result<AppConfig> {
        match fs::read_to_string(&self.path) {
            Ok(s) if s.trim().is_empty() => Ok(AppConfig::default()),
            Ok(s) => serde_json::from_str(&s)
                .with_context(|| format!("invalid configuration file {}", self.path.display())),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(AppConfig::default()),
            Err(e) => Err(e).with_context(|| format!("cannot read {}", self.path.display())),
        }
    }

    /// Writes atomically (temp file + rename) with 0600 permissions, since the file holds tokens.
    pub fn save(&self, cfg: &AppConfig) -> Result<()> {
        if let Some(dir) = self.path.parent() {
            fs::create_dir_all(dir).with_context(|| format!("cannot create {}", dir.display()))?;
        }
        let tmp = self.path.with_extension("json.tmp");
        fs::write(&tmp, serde_json::to_vec(cfg)?)
            .with_context(|| format!("cannot write {}", tmp.display()))?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            fs::set_permissions(&tmp, fs::Permissions::from_mode(0o600))?;
        }
        fs::rename(&tmp, &self.path)
            .with_context(|| format!("cannot write {}", self.path.display()))?;
        Ok(())
    }

    pub fn update(&self, p: Provider, c: RepoConfig) -> Result<()> {
        let mut cfg = self.load()?;
        cfg.set(p, c);
        self.save(&cfg)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_file_written_by_typescript_version() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config.json");
        fs::write(
            &path,
            r#"{"github":{"username":"me","apiKey":"ghp_x"},"gitlab":{},"bitbucket":{}}"#,
        )
        .unwrap();
        let cfg = Store::at(&path).load().unwrap();
        assert_eq!(cfg.github.username.as_deref(), Some("me"));
        assert!(cfg.github.is_complete());
        assert!(!cfg.gitlab.is_complete());
    }

    #[test]
    fn missing_file_is_empty_config_and_roundtrips() {
        let dir = tempfile::tempdir().unwrap();
        let store = Store::at(dir.path().join("sub/config.json"));
        assert!(!store.load().unwrap().bitbucket.is_complete());
        store
            .update(
                Provider::Bitbucket,
                RepoConfig {
                    username: Some("u".into()),
                    api_key: Some("k".into()),
                },
            )
            .unwrap();
        let raw = fs::read_to_string(store.path()).unwrap();
        assert!(
            raw.contains(r#""bitbucket":{"apiKey":"k","username":"u"}"#),
            "{raw}"
        );
        assert!(store.load().unwrap().bitbucket.is_complete());
    }
}
