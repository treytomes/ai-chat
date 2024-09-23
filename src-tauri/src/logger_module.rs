use crate::event_bus::Origin;

use super::event_bus::EventKind;
use super::module::{Module, ModuleCtx};
use anyhow::Result;
use async_trait::async_trait;

pub struct Logger {
    ctx: ModuleCtx,
}

impl Logger {
    pub fn new(ctx: ModuleCtx) -> Self {
        Self { ctx }
    }
}

#[async_trait]
impl Module for Logger {
    async fn run(&mut self) -> Result<()> {
        loop {
            tokio::select! {
                e = self.ctx.receiver.recv() => {
                    match e {
                        Ok(event) => {
                            match event.inner {
                                EventKind::SubmitPrompt(message) | EventKind::SubmitStreamingPrompt(message) => {
                                    println!("{}: prompt: {}", &self.ctx.name, message)
                                },
                                // EventKind::Response(message) => {
                                //     println!("{}: response: {}", &self.ctx.name, message)
                                // },
                                // EventKind::StreamingResponse(message, origin) => {
                                //     match origin {
                                //         Origin::Begin => print!("{}: response: {}", &self.ctx.name, message),
                                //         Origin::Middle => print!("{}", message),
                                //         Origin::End => println!("{}", message),
                                //     }
                                // },
                                EventKind::ExitEvent => {
                                    break;
                                },
                                _ => {}, //println!("{:?}: {:?}", event.module, event.inner),
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
