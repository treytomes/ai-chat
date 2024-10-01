use crate::system::queries::get_timestamp;

use super::ConversationRole;
use serde::{Deserialize, Serialize};
use aws_sdk_bedrockruntime::types::{ContentBlock, Message as BedrockMessage};
use anyhow::Error;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    // id: String,
    role: ConversationRole,
    text: String,
    created_date: String,
}

impl Message {
    pub fn new(text: String, role: ConversationRole) -> Self {
        Self {
            role,
            text,
            created_date: get_timestamp(),
        }
    }

    pub fn into_bedrock_message(&self) -> Result<BedrockMessage, Error> {
        BedrockMessage::builder()
            .role(self.role.into_bedrock_role())
            .content(ContentBlock::Text(self.text.clone()))
            .build()
            .map_err(|e| Error::msg(format!("Failed to build message: {:?}", e)))
    }
}