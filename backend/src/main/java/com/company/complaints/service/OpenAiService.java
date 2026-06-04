package com.company.complaints.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class OpenAiService {

    private static final MediaType JSON = MediaType.get("application/json");

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.model}")
    private String model;

    @Value("${openai.max-tokens}")
    private int maxTokens;

    private final OkHttpClient client = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String call(String prompt) {
        try {
            String requestJson = objectMapper.writeValueAsString(Map.of(
                    "model", model,
                    "max_completion_tokens", maxTokens,
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    )
            ));

            Request request = new Request.Builder()
                    .url(apiUrl)
                    .post(RequestBody.create(requestJson, JSON))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .build();

            try (Response response = client.newCall(request).execute()) {
                String responseJson = response.body() != null ? response.body().string() : "";
                if (!response.isSuccessful()) {
                    log.error("OpenAI API returned HTTP {}: {}", response.code(), responseJson);
                    throw new RuntimeException("OpenAI HTTP " + response.code() + ": " + responseJson);
                }

                JsonNode root = objectMapper.readTree(responseJson);
                String text = root.path("choices").path(0).path("message").path("content").asText();
                if (text.isBlank()) {
                    log.warn("OpenAI returned empty text. Full response: {}", responseJson);
                }
                return text;
            }
        } catch (IOException e) {
            log.error("OpenAI API call failed", e);
            throw new RuntimeException("OpenAI API call failed", e);
        }
    }
}
