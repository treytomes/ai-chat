use super::get_caller_identity;

pub async fn is_authenticated(profile_name: &str) -> bool {
    match get_caller_identity(profile_name).await {
        Ok(_) => true,
        Err(_) => false,
    }
}
