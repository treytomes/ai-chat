// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod aws;

use std::{env, fs};
use std::{fs::File, io::BufReader, io::Write, path::Path};

use aws::models::{Credentials, Identity};
use llm::models::{Conversation, Message};
use serde::Serialize;
use settings::AWS_PROFILE_NAME;
use webbrowser::{open_browser, Browser};
use aws::queries;
use tauri::{AppHandle, Manager};

extern crate ini;

mod chat_module;
mod event_bus;
mod llm;
mod logger_module;
mod module;
mod repl_module;
mod settings;
use anyhow::Result;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct SubmitPromptPayload {
    prompt: String,
    conversation_id: String,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
struct ChatResponsePayload {
    response: String,
}

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
            match conversation.save(conversation_id) {
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
        .setup(|app| {
            // let handle = app.handle();

            // let id = app.listen_global("submit-prompt", |event| {
            //     println!("got submit-prompt with payload {:?}", event.payload());
 
            //     match event.payload() {
            //         Some(payload) => {
            //             let payload: Result<SubmitPromptPayload, serde_json::Error>  = serde_json::from_str(payload);
            //             match payload {
            //                 Ok(payload) => {
            //                     let handle_clone = handle.clone();
            //                     let process = tauri::async_runtime::spawn(async move {
            //                         match submit_prompt(payload.prompt.as_str(), payload.conversation_id.as_str()).await {
            //                             Ok(response) => {
            //                                 handle_clone.emit_all("chat-response", payload);

            //                                 // _app.emit_all(
            //                                 //     "local-server-down",
            //                                 //     ReceiveCodePayload {
            //                                 //         code: String::from("test"),
            //                                 //     },
            //                                 // );
            //                             },
            //                             Err(e) => eprintln!("Error: {:?}", e),
            //                         };
            //                     });
            //                 },
            //                 Err(e) => eprintln!("Error: {:?}", e),
            //             }
            //         },
            //         None => eprintln!("submit-prompt missing incoming payload."),
            //     };
            // });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // AWS Authentication
            export_credentials,
            get_caller_identity,
            list_profiles,
            login,

            // AI Chat
            submit_prompt,
            load_conversation,

            // Misc
            open_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
