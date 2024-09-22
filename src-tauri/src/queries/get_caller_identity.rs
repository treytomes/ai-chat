use serde_json::Value;

use crate::models::Identity;

use super::exec_async::exec_async;

pub async fn get_caller_identity(profile_name: &str) -> Result<Identity, String> {
    let result = exec_async(
        "aws",
        &["sts", "get-caller-identity", "--profile", profile_name],
    )
    .await;
    match result {
        Ok(s) => match serde_json::from_str::<Value>(&s) {
            Ok(json) => {
                let user_id = match (&json["UserId"]).as_str() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse UserId.".to_string());
                    }
                };
                let account = match (&json["Account"]).as_str() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse Account.".to_string());
                    }
                };
                let arn = match (&json["Arn"]).as_str() {
                    Some(v) => v,
                    None => {
                        return Err("Unable to parse Arn.".to_string());
                    }
                };

                Ok(Identity::new(user_id, account, arn))
            }
            Err(e) => Err(format!("Unable to parse credentials json: {}", e)),
        },
        Err(s) => Err(s),
    }
}
