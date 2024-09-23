use crate::{llm::models::Conversation, settings::MODEL_ID};
use super::{get_client, get_inference_config};
use aws_sdk_bedrockruntime::operation::converse::builders::ConverseFluentBuilder;
use anyhow::Error;

pub async fn get_builder(conversation: &Conversation) -> Result<ConverseFluentBuilder, Error> {
    // TODO: Move the client into a shared space.
    let mut builder = get_client().await
        .converse()
        .model_id(MODEL_ID)
        .inference_config(get_inference_config());

    for msg in conversation.iter() {
        match msg.into_bedrock_message() {
            Ok(msg) => {
                builder = builder.messages(msg);
            },
            Err(e) => {
                return Err(e);
            }
        };
    }

    Ok(builder)
}
