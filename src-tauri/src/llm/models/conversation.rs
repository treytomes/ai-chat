use std::{fs::{self, File}, io::BufReader, io::Write, path::Path};

use anyhow::Error;
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

    fn get_path(id: &str) -> String {
        let path = Path::new("conversations");
        if !path.exists() {
            let _ = fs::create_dir_all("conversations");
        }
        let path = path.join(format!("{}.json", id));
        path.to_str().unwrap().to_string()
    }

    /**
     * Load a conversation from file, if it exists.
     */
    pub fn from_id(id: &str) -> Result<Self, Error> {
        let path = Self::get_path(id);
    
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

    pub fn save(&self, id: &str) -> Result<(), Error> {
        match serde_json::to_string(&self) {
            Ok(json_text) => {
                let path = Self::get_path(id);

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