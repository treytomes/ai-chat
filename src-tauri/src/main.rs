// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod aws;

use aws::models::{Credentials, Identity};
use webbrowser::{open_browser, Browser};
use aws::queries;

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            export_credentials,
            get_caller_identity,
            list_profiles,
            login,
            open_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
