package com.example.app.controller;

import com.example.app.dto.request.CreateAgentRequest;
import com.example.app.dto.response.AgentResponse;
import com.example.app.dto.response.ApiResponse;
import com.example.app.service.AgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class AgentController {
    private final AgentService service;

    @GetMapping
    public ApiResponse<List<AgentResponse>> getAll() {
        return ApiResponse.ok(service.getAll());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AgentResponse> create(@Valid @RequestBody CreateAgentRequest req) {
        return ApiResponse.ok("Tạo đại lý thành công", service.create(req));
    }
}
