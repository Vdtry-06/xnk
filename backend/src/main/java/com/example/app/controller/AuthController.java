package com.example.app.controller;

import com.example.app.dto.request.CreateManagerRequest;
import com.example.app.dto.request.LoginRequest;
import com.example.app.dto.response.ApiResponse;
import com.example.app.entity.*;
import com.example.app.enums.Role;
import com.example.app.repository.ManagerRepository;
import com.example.app.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final ManagerRepository managerRepository;


    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest req) {
        User user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("Sai tên đăng nhập hoặc mật khẩu"));

        if (!req.password().equals(user.getPassword())) {
            throw new IllegalArgumentException("Sai tên đăng nhập hoặc mật khẩu");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("userId", user.getId());
        data.put("username", user.getUsername());
        data.put("role", user.getRole().name());

        if (user instanceof Agent a) {
            data.put("code", a.getCode());
            data.put("name", a.getName());
            data.put("phone", a.getPhone());
            data.put("address", a.getAddress());
        } else if (user instanceof WarehouseStaff ws) {
            data.put("name", ws.getName());
        }

        return ApiResponse.ok(data);
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@RequestBody @Valid CreateManagerRequest req) {
        if (userRepository.findByUsername(req.username()).isPresent())
            throw new IllegalArgumentException("Username đã tồn tại: " + req.username());
 
        Manager manager = new Manager();
        manager.setUsername(req.username());
        manager.setPassword(req.password());
        manager.setRole(Role.ADMIN);
        managerRepository.save(manager);
 
        Map<String, Object> data = new HashMap<>();
        data.put("userId",   manager.getId());
        data.put("username", manager.getUsername());
        data.put("role",     manager.getRole().name());
        return ApiResponse.ok(data);
    }
}
