use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Credentials {
    pub version: i64,
    pub access_key_id: String,
    pub secret_access_key: String,
    pub session_token: String,
    pub expiration: DateTime<Local>,
}

impl Credentials {
    pub fn new(
        version: i64,
        access_key_id: &str,
        secret_access_key: &str,
        session_token: &str,
        expiration: DateTime<Local>,
    ) -> Credentials {
        Self {
            version,
            access_key_id: access_key_id.to_string(),
            secret_access_key: secret_access_key.to_string(),
            session_token: session_token.to_string(),
            expiration,
        }
    }
}
