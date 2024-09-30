use std::{fs, path::Path};

/**
 * Guaranty that a path exists.
 */
pub fn ensure_path(path: &str) {
    let path = Path::new(path);
    if !path.exists() {
        let _ = fs::create_dir_all(path);
    }
}