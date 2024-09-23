use aws_sdk_bedrockruntime::{operation::{converse::ConverseError, converse_stream::ConverseStreamError}, types::error::ConverseStreamOutputError};
use aws_sdk_bedrockruntime::error::ProvideErrorMetadata;

use crate::settings::MODEL_ID;

#[derive(Debug)]
pub struct BedrockConverseError(pub String);

impl std::fmt::Display for BedrockConverseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Can't invoke '{}'. Reason: {}", MODEL_ID, self.0)
    }
}

impl std::error::Error for BedrockConverseError {}

impl From<&str> for BedrockConverseError {
    fn from(value: &str) -> Self {
        BedrockConverseError(value.to_string())
    }
}

impl From<&ConverseError> for BedrockConverseError {
    fn from(value: &ConverseError) -> Self {
        BedrockConverseError::from(match value {
            ConverseError::ModelTimeoutException(_) => "Model took too long",
            ConverseError::ModelNotReadyException(_) => "Model is not ready",
            _ => "Unknown",
        })
    }
}

impl From<&ConverseStreamError> for BedrockConverseError {
    fn from(value: &ConverseStreamError) -> Self {
        BedrockConverseError(
            match value {
                ConverseStreamError::ModelTimeoutException(_) => "Model took too long",
                ConverseStreamError::ModelNotReadyException(_) => "Model is not ready",
                _ => "Unknown",
            }
            .into(),
        )
    }
}

impl From<&ConverseStreamOutputError> for BedrockConverseError {
    fn from(value: &ConverseStreamOutputError) -> Self {
        match value {
            ConverseStreamOutputError::ValidationException(ve) => BedrockConverseError(
                ve.message().unwrap_or("Unknown ValidationException").into(),
            ),
            ConverseStreamOutputError::ThrottlingException(te) => BedrockConverseError(
                te.message().unwrap_or("Unknown ThrottlingException").into(),
            ),
            value => BedrockConverseError(
                value
                    .message()
                    .unwrap_or("Unknown StreamOutput exception")
                    .into(),
            ),
        }
    }
}