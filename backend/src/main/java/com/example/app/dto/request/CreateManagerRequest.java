package com.example.app.dto.request;
import jakarta.validation.constraints.NotBlank;
 
public record CreateManagerRequest(
    @NotBlank String username,
    @NotBlank String password
) {}
 







