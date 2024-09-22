use super::exec_async::exec_async;

pub async fn list_profiles() -> Result<Vec<String>, String> {
    let result = exec_async("aws", &["configure", "list-profiles"]).await;
    match result {
        Ok(s) => {
            let profiles = s
                .trim()
                .split("\n")
                .map(|s| s.trim().to_string())
                .collect::<Vec<String>>();
            Ok(profiles)
        }
        Err(s) => Err(s),
    }
}
