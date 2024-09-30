use std::{fs::{self, File}, io::BufReader, path::Path};
use anyhow::Error;

use crate::{llm::queries::get_conversation_path, settings::CONVERSATIONS_DATA_PATH, system::queries::{ensure_path, get_files_by_extension}};

/**
 * Conversation summaries populate the selection panel.
 * Conversations can be renamed.
 */
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ConversationSummary {
    pub title: String,
    pub id: String,
}

impl ConversationSummary {
    pub fn new(title: &str, id: &str) -> Self {
        Self {
            title: title.to_string(),
            id: id.to_string(),
        }
    }

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

    pub fn get_all() -> Vec<Self> {
        ensure_path(CONVERSATIONS_DATA_PATH);
        let mut summaries = vec![];
        let ids = get_files_by_extension(CONVERSATIONS_DATA_PATH, ".json");
        for id in ids {
            match Self::from_id(&id) {
                Ok(s) => summaries.push(s),
                Err(_) => {
                    // Skip the invalid conversations.
                }
            }
        }
        summaries
    }
}