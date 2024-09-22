use chrono::DateTime;
use serde_json::Value;

use crate::models::Credentials;

use super::exec_async::exec_async;

pub async fn export_credentials(profile_name: &str) -> Result<Credentials, String> {
    let result = exec_async(
        "aws",
        &["configure", "export-credentials", "--profile", profile_name],
    )
    .await;
    match result {
        Ok(s) => match serde_json::from_str::<Value>(&s) {
            Ok(json) => {
                let version = match (&json["Version"]).as_i64() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse Version.".to_string());
                    }
                };
                let access_key_id = match (&json["AccessKeyId"]).as_str() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse AccessKeyId.".to_string());
                    }
                };
                let secret_access_key = match (&json["SecretAccessKey"]).as_str() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse SecretAccessKey.".to_string());
                    }
                };
                let session_token = match (&json["SessionToken"]).as_str() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse SessionToken.".to_string());
                    }
                };
                let expiration = match (&json["Expiration"]).as_str() {
                    Some(v) => match DateTime::parse_from_rfc3339(v) {
                        Ok(d) => d.with_timezone(&chrono::Local),
                        Err(e) => {
                            return Err(format!("Unable to parse Expiration: {}", e));
                        }
                    },
                    None => {
                        return Err("Unable to parse Expiration.".to_string());
                    }
                };

                Ok(Credentials::new(
                    version,
                    access_key_id,
                    secret_access_key,
                    session_token,
                    expiration,
                ))
            }
            Err(e) => Err(format!("Unable to parse credentials json: {}", e)),
        },
        Err(s) => Err(s),
    }
}
