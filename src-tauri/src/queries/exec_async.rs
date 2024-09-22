use core::str;

use async_process::Command;

pub async fn exec_async(program: &str, args: &[&str]) -> Result<String, String> {
    let cmd = Command::new(program).args(args).output().await;

    match cmd {
        Ok(out) => {
            let stdout = match str::from_utf8(&out.stdout) {
                Ok(v) => v,
                Err(e) => return Err(format!("Invalid UTF-8 sequence: {}", e)),
            };
            if (stdout.len() > 0) {
                return Ok(stdout.to_string());
            }
            let stderr = match str::from_utf8(&out.stderr) {
                Ok(v) => v,
                Err(e) => return Err(format!("Invalid UTF-8 sequence: {}", e)),
            };
            if stderr.len() > 0 {
                return Err(stderr.to_string());
            }
            return Ok("".to_string());
        }
        Err(e) => println!("err: {}", e),
    }

    Ok("Done.".to_string())
}
