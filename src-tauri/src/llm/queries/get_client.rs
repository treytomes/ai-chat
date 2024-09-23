use aws_config::BehaviorVersion;
use aws_sdk_bedrockruntime::Client;

use crate::settings::AWS_REGION;

pub async fn get_client() -> Client {
    let sdk_config = aws_config::defaults(BehaviorVersion::latest())
    .region(AWS_REGION)
    .load()
    .await;

    Client::new(&sdk_config)
}