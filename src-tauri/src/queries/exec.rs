use std::process::{Command, Stdio};
use std::io::Read;

/**
 * Execute the given program with an array of arguments,
 * returning either the standard output or standard error streams
 * on success or failure.
 */
pub fn exec(program: &str, args: &[&str]) -> Result<String, String> {
    let child = Command::new(program)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .stdin(Stdio::null())
        .spawn();

    let mut child = match child {
        Ok(c) => c,
        Err(e) => return Err(format!("Error spawning child process: {}", e)),
    };

    let status = child.wait();

    let mut stdout = match child.stdout {
        Some(s) => s,
        None => return Err("Failed to open stdout on child process.".to_string()),
    };

    let mut stderr = match child.stderr {
        Some(s) => s,
        None => return Err("Failed to open stderr on child process.".to_string()),
    };

    let output = match status {
        Ok(o) => o,
        Err(e) => panic!("Error waiting for command: {}", e),
    };

    // Read stderr into a string.
    let mut stderr_buffer = String::new();
    match stderr.read_to_string(&mut stderr_buffer) {
        Ok(_) => (),
        Err(e) => return Err(format!("Error reading stderr: {}", e)),
    }

    if stderr_buffer.len() > 0 {
        return Err(stderr_buffer.trim().to_string());
    }

    // Read stdout into a string.
    let mut stdout_buffer = String::new();
    match stdout.read_to_string(&mut stdout_buffer) {
        Ok(_) => (),
        Err(e) => return Err(format!("Error reading stdout: {}", e)),
    }
    stdout_buffer = stdout_buffer.trim().to_string();

    match output.code() {
        Some(0) => Ok(stdout_buffer),
        _ => Err(format!("Unknown error executing command.")),
    }
}
