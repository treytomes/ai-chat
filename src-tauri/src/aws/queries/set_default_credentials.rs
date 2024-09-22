use ini::Ini;
use std::path::Path;

use crate::aws::models::Credentials;

fn get_credentials_path() -> String {
    let home_path = home::home_dir().unwrap();
    let home_path = home_path.to_str().unwrap().replace("\\", "/");
    let cred_path = Path::new(&home_path).join(".aws").join("credentials");
    let cred_path = cred_path.to_str().unwrap();
    return cred_path.to_string();
}

/**
 * Save default credentials to the AWS credential file.
 */
pub fn set_default_credentials(creds: Credentials) {
    let cred_path = get_credentials_path();
    let mut ini = Ini::new();

    ini.with_section(Some("default"))
        .set("aws_access_key_id", creds.access_key_id)
        .set("aws_secret_access_key", creds.secret_access_key)
        .set("aws_session_token", creds.session_token);
    match ini.write_to_file(cred_path.as_str()) {
        Ok(_) => println!("Default AWS credentials updated."),
        Err(e) => eprintln!("{:?}", e),
    };
}
