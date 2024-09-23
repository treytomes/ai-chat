use aws_sdk_bedrockruntime::types::InferenceConfiguration;

pub fn get_inference_config() -> InferenceConfiguration {
    InferenceConfiguration::builder()
        .max_tokens(4096)
        .temperature(1.0)
        .top_p(0.999)
        .stop_sequences("Human:")
        .build()
}