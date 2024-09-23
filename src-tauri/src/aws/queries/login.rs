use crate::aws::models::Credentials;
use super::{exec_async::exec_async, export_credentials};
use anyhow::Error;

pub async fn login(profile_name: &str) -> Result<Credentials, Error> {
    let result = exec_async("aws", &["sso", "login", "--profile", profile_name]).await;

    match result {
        Ok(_) => {
            match export_credentials(profile_name).await {
                Ok(result) => Ok(result),
                Err(e) => Err(e),
            }
        },
        Err(s) => Err(Error::msg(s)),
    }
}
