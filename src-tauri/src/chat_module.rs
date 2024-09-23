use crate::llm::models::{BedrockConverseError, Conversation};
use crate::event_bus::Origin;
use crate::llm::models::HasOutputText;
use crate::settings::MODEL_ID;
use crate::llm::queries::{get_client, get_inference_config};

use super::event_bus::EventKind;
use super::module::{Module, ModuleCtx};
use anyhow::Result;
use async_trait::async_trait;
use aws_sdk_bedrockruntime::operation::converse_stream::builders::ConverseStreamFluentBuilder;
use aws_sdk_bedrockruntime::operation::converse_stream::ConverseStreamOutput;
use aws_sdk_bedrockruntime::types::InferenceConfiguration;
use aws_sdk_bedrockruntime::Client;

pub struct Chat {
    ctx: ModuleCtx,
    client: Client,
    inference_config: InferenceConfiguration,
    conversation: Conversation,
}

impl Chat {
    pub async fn new(ctx: ModuleCtx) -> Self {
        let client = get_client().await;

        // Defaults pulled from the AWS Bedrock Chat Playground.
        let inference_config = get_inference_config();

        Self {
            ctx,
            client,
            conversation: Conversation::new(),
            inference_config,
        }
    }

    fn get_streaming_builder(&self) -> Result<ConverseStreamFluentBuilder, BedrockConverseError> {
        let mut builder = self.client
            .converse_stream()
            .model_id(MODEL_ID)
            .inference_config(self.inference_config.clone());

        for msg in self.conversation.iter() {
            match msg.into_bedrock_message() {
                Ok(msg) => {
                    builder = builder.messages(msg);
                },
                Err(e) => {
                    return Err(BedrockConverseError(e.to_string()));
                }
            };
        }

        Ok(builder)
    }

    async fn process_streaming_response(&mut self, response: ConverseStreamOutput) -> Result<(), BedrockConverseError> {
        let mut stream = response.stream;

        let mut is_first = true;
        let mut full_response_text = "".to_string();
        loop {
            let token = stream.recv().await;
            match token {
                Ok(Some(text)) => {
                    let next = text.get_output_text()?;
                    full_response_text += &next;
                    let _ = self.ctx.send(EventKind::StreamingResponse(next, if is_first { Origin::Begin } else { Origin::Middle }));
                    is_first = false;
                    Ok(())
                }
                Ok(None) => {
                    let _ = self.ctx.send(EventKind::StreamingResponse("".to_string(), Origin::End));
                    let _ = self.conversation.append_assistant_message(full_response_text);
                    break
                },
                Err(e) => Err(e
                    .as_service_error()
                    .map(BedrockConverseError::from)
                    .unwrap_or(BedrockConverseError(
                        "Unknown error receiving stream".into(),
                    ))),
            }?
        }

        Ok(())
    }

    async fn submit_prompt(&mut self, msg: String) -> Result<(), BedrockConverseError> {
        let response = crate::llm::queries::submit_prompt(&msg, &mut self.conversation).await;

        match response {
            Ok(output) => {
                match self.ctx.send(EventKind::Response(output)) {
                    Ok(_) => Ok(()),
                    Err(e) => Err(BedrockConverseError(e.to_string().into())),
                }
            },
            Err(e) => Err(BedrockConverseError(e.to_string().into())),
        }
    }
    
    async fn submit_streaming_prompt(&mut self, msg: String) -> Result<(), BedrockConverseError> {
        let _ = self.conversation.append_user_message(msg);
        
        match self.get_streaming_builder() {
            Ok(builder) => {
                let response = builder.send().await;

                match response {
                    Ok(output) => {
                        match self.process_streaming_response(output).await {
                            Ok(_) => Ok(()),
                            Err(e) => Err(e),
                        }
                    },
                    Err(e) => {
                        Err(BedrockConverseError::from(
                            e.as_service_error().unwrap(),
                        ))
                    },
                }
            },
            Err(e) => Err(e)
        }
    }
}

#[async_trait]
impl Module for Chat {
    async fn run(&mut self) -> Result<()> {
        loop {
            tokio::select! {
                e = self.ctx.receiver.recv() => {
                    match e {
                        Ok(event) => {
                            match event.inner {
                                EventKind::ExitEvent => {
                                    break;
                                },
                                EventKind::SubmitPrompt(message) => {
                                    match self.submit_prompt(message).await {
                                        Ok(_) => {},
                                        Err(e) => println!("SubmitPrompt error: {}", e),
                                    };
                                },
                                EventKind::SubmitStreamingPrompt(message) => {
                                    match self.submit_streaming_prompt(message).await {
                                        Ok(_) => {},
                                        Err(e) => println!("SubmitStreamingPrompt error: {}", e),
                                    }
                                },
                                _ => {},
                            }
                        },
                        Err(e) => println!("Error: {}", e),
                    }
                },
            }
        }

        Ok(())
    }
}
