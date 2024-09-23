// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod aws;

use std::{env, fs};
use std::{fs::File, io::BufReader, io::Write, path::Path};

use aws::models::{Credentials, Identity};
use llm::models::Conversation;
use serde::Serialize;
use webbrowser::{open_browser, Browser};
use aws::queries;

extern crate ini;

mod chat_module;
mod event_bus;
mod llm;
mod logger_module;
mod module;
mod repl_module;
mod settings;
use anyhow::{Error, Result};

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
async fn login(profile_name: &str) -> Result<String, String> {
    match queries::login(profile_name).await {
        Ok(r) => Ok(r),
        Err(e) => Err(format!("{:?}", e))
    }
}

#[tauri::command]
fn open_url(url: &str) {
    if open_browser(Browser::Default, &url).is_ok() {
        println!("Opening url: {}", &url)
    }
}

async fn is_authenticated() -> bool {
    match aws::queries::get_caller_identity("sandbox").await {
        Ok(_) => true,
        Err(_) => false,
    }
}

async fn login_aws(profile_name: &str) -> Result<aws::models::Credentials, Error> {
    let _ = aws::queries::login(profile_name).await;
    aws::queries::export_credentials(profile_name).await
}

#[tauri::command]
async fn submit_prompt(prompt: &str, conversation_id: &str) -> Result<String, String> {
    let path = Path::new("conversations");
    if !path.exists() {
        let _ = fs::create_dir_all("conversations");
    }
    let path = path.join(format!("{}.json", conversation_id));
    let path = path.as_path();

    let conversation = match path.exists() {
        true => {
            match File::open(path) {
                Ok(file) => {
                    let reader = BufReader::new(file);
        
                    // Read the JSON contents of the file as an instance of `User`.
                    match serde_json::from_reader(reader) {
                        Ok(c) => Ok(c),
                        Err(e) => Err(e.to_string()),
                    }
                },
                Err(e) => Err(e.to_string()),
            }
        },
        false => Ok(Conversation::new())
    };

    match conversation {
        Ok(mut conversation) => {
            match llm::queries::submit_prompt(prompt, &mut conversation).await {
                Ok(response) => {
                    match serde_json::to_string(&conversation) {
                        Ok(json_text) => {
                            match File::create(path) {
                                Ok(mut file) => {
                                    match file.write_all(json_text.as_bytes()) {
                                        Ok(_) => Ok(response),
                                        Err(e) => Err(e.to_string()),
                                    }
                                },
                                Err(e) => Err(e.to_string()),
                            }
                        },
                        Err(e) => Err(e.to_string())
                    }
                },
                Err(e) => Err(e.to_string()),
            }
        },
        Err(e) => Err(e),
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    if !is_authenticated().await {
        let profile_name = "sandbox";
        let creds = match login_aws(profile_name).await {
            Ok(result) => result,
            Err(e) => panic!("Unable to login: {}", e)
        };

        aws::queries::set_default_credentials(creds);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            export_credentials,
            get_caller_identity,
            list_profiles,
            login,
            open_url,
            submit_prompt,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
