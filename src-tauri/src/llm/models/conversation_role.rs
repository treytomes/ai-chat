use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum ConversationRole {
    Assistant,
    User
}

use aws_sdk_bedrockruntime::types::ConversationRole as BedrockConversationRole;
impl ConversationRole {
    pub fn into_bedrock_role(&self) -> BedrockConversationRole {
        match self {
            ConversationRole::Assistant => BedrockConversationRole::Assistant,
            ConversationRole::User => BedrockConversationRole::User,
        }
    }
}