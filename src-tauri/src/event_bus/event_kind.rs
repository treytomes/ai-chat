use super::{Event, Origin};

#[derive(Clone, Debug)]
pub enum EventKind {
    ExitEvent,
    SubmitPrompt(String),
    SubmitStreamingPrompt(String),
    Response(String),
    StreamingResponse(String, Origin),
}

impl EventKind {
    pub fn event(&self, module: &String) -> Event {
        Event {
            module: module.to_string(),
            inner: self.clone()
        }
    }
}
