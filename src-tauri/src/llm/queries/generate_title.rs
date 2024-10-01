use anyhow::Error;

use crate::llm::models::Conversation;
use super::submit_prompt;

/**
 * Have the LLM generate a title for the conversation.
 */
pub async fn generate_title(conversation: &Conversation) -> Result<String, Error> {
    let mut cloned_conversation = conversation.clone();
    submit_prompt("Provide a short title for this conversation.  This title, with only the text of the title, should be your only response.", &mut cloned_conversation).await
}
