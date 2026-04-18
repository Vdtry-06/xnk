package com.example.app.dto.request;
import jakarta.validation.constraints.*;

public record CreateAgentRequest(
    @NotBlank String username,
    @NotBlank String password,
    @NotBlank String code,
    @NotBlank String name,
    String phone,
    String address,
    @NotNull Long managerId
) {}
