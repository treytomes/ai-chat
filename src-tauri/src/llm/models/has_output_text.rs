use aws_sdk_bedrockruntime::{operation::converse::ConverseOutput, types::ConverseStreamOutput};

use super::BedrockConverseError;

pub trait HasOutputText {
    fn get_output_text(&self) -> Result<String, BedrockConverseError>;
}

impl HasOutputText for ConverseOutput {
    fn get_output_text(&self) -> Result<String, BedrockConverseError> {
        let text = self
            .output()
            .ok_or("no output")?
            .as_message()
            .map_err(|_| "output not a message")?
            .content()
            .first()
            .ok_or("no content in message")?
            .as_text()
            .map_err(|_| "content is not text")?
            .to_string();
        Ok(text)
    }   
}

impl HasOutputText for ConverseStreamOutput {
    fn get_output_text(&self) -> Result<String, BedrockConverseError> {
        Ok(match self {
            ConverseStreamOutput::ContentBlockDelta(event) => match event.delta() {
                Some(delta) => delta.as_text().cloned().unwrap_or_else(|_| "".into()),
                None => "".into(),
            },
            _ => "".into(),
        })
    }   
}
