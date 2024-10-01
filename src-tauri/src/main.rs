// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

extern crate ini;

mod aws;
mod chat_module;
mod event_bus;
mod llm;
mod logger_module;
mod module;
mod repl_module;
mod settings;
mod system;

use anyhow::Result;

use std::env;

use aws::models::{Credentials, Identity};
use llm::models::{ChatResponsePayload, Conversation, ConversationSummary};
use settings::AWS_PROFILE_NAME;
use webbrowser::{open_browser, Browser};
use aws::queries;
use tauri::{AppHandle, Manager};


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[tauri::command(async)]
async fn export_credentials(profile_name: &str) -> Result<Credentials, String> {
    match queries::export_credentials(profile_name).await {
        Ok(r) => Ok(r),
        Err(e) => Err(format!("{:?}", e))
    }
}

#[tauri::command(async)]
async fn get_caller_identity(profile_name: &str) -> Result<Identity, String> {
    match queries::get_caller_identity(profile_name).await {
        Ok(r) => Ok(r),
        Err(e) => Err(format!("{:?}", e))
    }
}

#[tauri::command(async)]
async fn list_profiles() -> Result<Vec<String>, String> {
    match queries::list_profiles().await {
        Ok(r) => Ok(r),
        Err(e) => Err(format!("{:?}", e))
    }
}

#[tauri::command(async)]
async fn login(profile_name: &str) -> Result<Credentials, String> {
    queries::login(profile_name)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn open_url(url: &str) {
    if open_browser(Browser::Default, &url).is_ok() {
        println!("Opening url: {}", &url)
    }
}

#[tauri::command]
async fn submit_prompt(app_handle: AppHandle, prompt: &str, conversation_id: &str) -> Result<String, String> {
    let mut conversation = match Conversation::from_id(conversation_id) {
        Ok(c) => c,
        Err(_) => Conversation::new()
    };

    match llm::queries::submit_prompt(prompt, &mut conversation).await {
        Ok(response) => {
            match conversation.save(conversation_id).await {
                Ok(_) => {
                    match app_handle.emit_all("chat-response", ChatResponsePayload {
                        response: response.clone()
                    }) {
                        Ok(_) => Ok(response),
                        Err(e) => Err(e.to_string()),
                    }
                },
                Err(e) => Err(e.to_string())
            }
        },
        Err(e) => Err(e.to_string()),
    }
}

/**
 * Get a list of conversation ids and names.
 */
#[tauri::command]
async fn list_conversations() -> Vec<ConversationSummary> {
    ConversationSummary::get_all()
}

#[tauri::command]
async fn load_conversation(conversation_id: &str) -> Result<Conversation, String> {
    Conversation::from_id(conversation_id).map_err(|e| e.to_string())
}

#[tokio::main]
async fn main() -> Result<()> {
    if !aws::queries::is_authenticated(AWS_PROFILE_NAME).await {
        let creds = match aws::queries::login(AWS_PROFILE_NAME).await {
            Ok(result) => result,
            Err(e) => panic!("Unable to login: {}", e)
        };

        aws::queries::set_default_credentials(creds);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // AWS Authentication
            export_credentials,
            get_caller_identity,
            list_profiles,
            login,

            // AI Chat
            list_conversations,
            load_conversation,
            submit_prompt,

            // Misc
            open_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
