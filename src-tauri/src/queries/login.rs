use super::exec_async::exec_async;

pub async fn login(profile_name: &str) -> Result<String, String> {
    let result = exec_async("aws", &["sso", "login", "--profile", profile_name]).await;

    match result {
        Ok(_) => Ok(format!("Logged in to {}", profile_name)),
        Err(s) => Err(s),
    }
}
