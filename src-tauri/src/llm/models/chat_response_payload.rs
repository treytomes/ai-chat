/**
 * Event payload used to send a chat response to the frontend.
 */
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct ChatResponsePayload {
    pub response: String,
}
