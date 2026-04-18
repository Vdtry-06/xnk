package com.example.app.dto.response;

public record AgentResponse(
    Long id,
    String username,
    String code,
    String name,
    String phone,
    String address,
    Long managerId,
    String managerName
) {}
