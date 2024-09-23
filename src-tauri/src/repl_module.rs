use std::io::{self, Write};

use crate::event_bus::{Event, Origin};

use super::event_bus::EventKind;
use super::module::{Module, ModuleCtx};
use anyhow::Result;
use async_trait::async_trait;

pub struct REPL {
    ctx: ModuleCtx,
    is_waiting: bool,
}

impl REPL {
    pub fn new(ctx: ModuleCtx) -> Self {
        Self { ctx, is_waiting: false }
    }
}

#[async_trait]
impl Module for REPL {
    async fn run(&mut self) -> Result<()> {
        let mut use_async = true;

        println!("Beginning REPL.");
        loop {
            if !self.is_waiting {
                let mut buffer = String::new();

                let mut stdout = io::stdout();
                print!("prompt> ");
                let _ = stdout.flush();

                let stdin = io::stdin();
                stdin.read_line(&mut buffer)?;
                buffer = buffer.trim().to_string();
                if buffer.len() == 0 {
                    continue;
                }

                if buffer == "async" {
                    use_async = true;
                    println!("***sending async***");
                } else if buffer == "sync" {
                    use_async = false;
                    println!("***sending sync***");
                } else {
                    self.is_waiting = true;
                    let event = if buffer == "exit" {
                        Event {
                            module: self.ctx.name.to_string(),
                            inner: EventKind::ExitEvent,
                        }
                    } else if use_async {
                        Event {
                            module: self.ctx.name.to_string(),
                            inner: EventKind::SubmitStreamingPrompt(buffer),
                        }
                    } else {
                        Event {
                            module: self.ctx.name.to_string(),
                            inner: EventKind::SubmitPrompt(buffer),
                        }
                    };
                    self.ctx.sender
                        .send(event)
                        .unwrap();
                }
            } else {
                tokio::select! {
                    e = self.ctx.receiver.recv() => {
                        match e {
                            Ok(event) => {
                                match event.inner {
                                    EventKind::Response(message) => {
                                        println!("response: {}", message);
                                        self.is_waiting = false;
                                    },
                                    EventKind::StreamingResponse(message, origin) => {
                                        match origin {
                                            Origin::Begin => print!("response: {}", message),
                                            Origin::Middle => print!("{}", message),
                                            Origin::End => {
                                                println!("{}", message);
                                                self.is_waiting = false;
                                            },
                                        }
                                    },
                                    EventKind::ExitEvent => {
                                        break;
                                    },
                                    _ => {},
                                }
                            },
                            Err(e) => println!("Error: {}", e),
                        }
                    },
                }
            }
        }

        Ok(())
    }
}
