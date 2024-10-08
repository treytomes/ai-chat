use std::{fs::File, io::BufReader, io::Write, path::Path};
use anyhow::Error;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use crate::{llm::queries::{generate_title, get_conversation_path}, system::queries::get_timestamp};
use super::{ConversationRole, Message};
// use aws_sdk_bedrockruntime::types::{ContentBlock, ConversationRole, Message};

#[derive(Serialize, Deserialize, Clone)]
pub struct Conversation {
    id: String,
    title: String,
    messages: Vec<Message>,
    created_date: String,
    last_modified_date: String,
}

impl Conversation {
    pub fn new() -> Self {
        Self {
            id: "".to_string(),
            title: "".to_string(),
            messages: vec![],
            created_date: get_timestamp(),
            last_modified_date: get_timestamp(),
        }
    }

    /**
     * Load a conversation from file, if it exists.
     */
    pub fn from_id(id: &str) -> Result<Self, Error> {
        let path = get_conversation_path(id);
    
        match Path::new(&path).exists() {
            true => {
                match File::open(path) {
                    Ok(file) => {
                        let reader = BufReader::new(file);
                        serde_json::from_reader(reader).map_err(|e| Error::new(e))
                    },
                    Err(e) => Err(Error::new(e)),
                }
            },
            false => Err(Error::msg(format!("Conversation id {} does not exist.", id)))
        }
    }

    pub async fn save(&mut self, id: &str) -> Result<(), Error> {
        self.last_modified_date = get_timestamp();
        self.id = id.to_string();
        if self.title.is_empty() || self.title == self.id {
            println!("Preparing to generate title...");
            self.title = match generate_title(self).await {
                Ok(title) => title,
                Err(_) => self.id.clone(),
            };
            println!("Here it is: {}", self.title);
        }

        match serde_json::to_string(&self) {
            Ok(json_text) => {
                let path = get_conversation_path(id);

                let mut file = File::create(path)
                    .map_err(|e| Error::new(e))?;

                file.write_all(json_text.as_bytes()).map_err(|e| Error::new(e))
            },
            Err(e) => Err(Error::new(e))
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