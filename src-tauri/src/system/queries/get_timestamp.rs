use chrono::{DateTime, Local};

pub fn get_timestamp() -> String {
    let now: DateTime<Local> = Local::now();
    let timestamp = now.to_rfc3339();
    timestamp
}