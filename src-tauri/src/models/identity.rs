use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Identity {
    pub user_id: String,
    pub account: String,
    pub arn: String,
}

impl Identity {
    pub fn new(user_id: &str, account: &str, arn: &str) -> Self {
        Self {
            user_id: user_id.to_string(),
            account: account.to_string(),
            arn: arn.to_string(),
        }
    }
}
