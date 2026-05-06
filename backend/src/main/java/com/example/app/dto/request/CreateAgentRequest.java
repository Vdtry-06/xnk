package com.example.app.dto.request;
import jakarta.validation.constraints.*;

public record CreateAgentRequest(
    @NotBlank String username,
    @NotBlank String password,
    @NotBlank String code,
    @NotBlank String name,
    @NotBlank(message = "Số điện thoại không được để trống")
    String phone,
    @NotBlank(message = "Địa chỉ không được để trống")
    String address,
    @NotNull Long managerId
) {}
