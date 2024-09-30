use std::path::Path;
use crate::{settings::CONVERSATIONS_DATA_PATH, system::queries::ensure_path};

/**
 * Get the full path to a conversation from the id.
 */
pub fn get_conversation_path(id: &str) -> String {
    ensure_path(CONVERSATIONS_DATA_PATH);
    let path = Path::new(CONVERSATIONS_DATA_PATH);
    let path = path.join(format!("{}.json", id));
    path.to_str().unwrap().to_string()
}
