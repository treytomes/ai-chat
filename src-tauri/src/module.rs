use crate::event_bus::EventKind;

use super::event_bus::{Event, EventBus};

use anyhow::Result;
use async_trait::async_trait;
use tokio::sync::broadcast::{self, error::SendError};

#[async_trait]
pub trait Module {
    // fn new(ctx: ModuleCtx) -> Self;
    async fn run(&mut self) -> Result<()>;
}

#[derive(Debug)]
pub struct ModuleCtx {
    pub name: String,
    pub sender: broadcast::Sender<Event>,
    pub receiver: broadcast::Receiver<Event>,
}

impl ModuleCtx {
    pub fn new(name: &str, bus: &EventBus) -> Self {
        let sender = bus.sender.clone();
        let receiver = bus.subscribe();

        ModuleCtx {
            name: name.to_string(),
            sender,
            receiver,
        }
    }
    
    pub fn send(&self, kind: EventKind) -> Result<(), SendError<Event>> {
        let event = kind.event(&self.name);
        match self.sender.send(event) {
            Ok(_) => Ok(()),
            Err(err) => Err(err),
        }
    }
}
