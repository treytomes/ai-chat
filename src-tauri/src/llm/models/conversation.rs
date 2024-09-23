// use aws_sdk_bedrockruntime::types::{ContentBlock, ConversationRole, Message};
use serde::{Deserialize, Serialize};

use super::{ConversationRole, Message};

#[derive(Serialize, Deserialize)]
pub struct Conversation {
    messages: Vec<Message>
}

impl Conversation {
    pub fn new() -> Self {
        Self {
            messages: vec![],
        }
    }

    fn append_message(&mut self, msg: String, role: ConversationRole) {
        self.messages.push(Message::new(msg, role));
    }

    pub fn append_user_message(&mut self, msg: String) {
        self.append_message(msg, ConversationRole::User)
    }

    pub fn append_assistant_message(&mut self, msg: String) {
        self.append_message(msg, ConversationRole::Assistant)
    }

    pub fn iter(&self) -> std::slice::Iter<'_, Message> {
        self.messages.iter()
    }
}