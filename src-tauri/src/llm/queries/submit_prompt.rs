use anyhow::Error;
use aws_sdk_bedrockruntime::operation::converse::ConverseError;

use crate::llm::models::{Conversation, HasOutputText};

use super::get_builder;

/**
 * Synchronous prompt submission.
 */
pub async fn submit_prompt(prompt: &str, conversation: &mut Conversation) -> Result<String, Error> {
    let _ = conversation.append_user_message(prompt.to_string());

    match get_builder(conversation).await {
        Ok(builder) => {
            let response = builder.send().await;

            match response {
                Ok(output) => {
                    match output.get_output_text() {
                        Ok(text) => {
                            let _ = conversation.append_assistant_message(text.clone());
                            Ok(text)
                        },
                        Err(e) => {
                            Err(Error::msg(e))
                        },
                    }
                },
                Err(e) => Err(e
                    .as_service_error()
                    .map(|e| {
                        match e {
                            ConverseError::ModelTimeoutException(_) => Error::msg("Model took too long"),
                            ConverseError::ModelNotReadyException(_) => Error::msg("Model is not ready"),
                            _ => Error::msg("Unknown"),
                        }
                    })
                    .unwrap_or_else(|| Error::msg("Unknown service error"))),
            }
        },
        Err(e) => Err(e),
    }
}