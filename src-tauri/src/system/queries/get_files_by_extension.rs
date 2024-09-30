use std::{fs, path::Path};

pub fn get_files_by_extension(dir_path: &str, file_ext: &str) -> Vec<String> {
    let mut files = Vec::new();
    match fs::read_dir(dir_path) {
        Ok(entries) => {
            // Read the contents of the directory.
            for entry in entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
        
                        // Check if the entry is a file and has the specified extension.
                        if path.is_file() && path.extension().unwrap_or_default() == file_ext.trim_start_matches('.') {
                            // Get the filename without the extension.
                            let filename = Path::new(&path)
                                .file_stem()
                                .unwrap_or_default()
                                .to_str()
                                .unwrap_or_default()
                                .to_string();
                            files.push(filename);
                        }        
                    },
                    Err(_) => {
                        // Skip any entries that had a problem.
                    }
                }
            }
        },
        Err(_) => {
            // On failure assume no files were found.
        }
    }
    files
}
