// Inspired by this project: https://github.com/JuxhinDB/event-bus-example
// https://blog.digital-horror.com/blog/event-bus-in-tokio/

mod event;
mod event_bus;
mod event_kind;
mod origin;

pub use event_bus::EventBus;
pub use event_kind::EventKind;
pub use event::Event;
pub use origin::Origin;
