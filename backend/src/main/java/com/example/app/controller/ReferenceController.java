package com.example.app.controller;
import com.example.app.dto.response.ApiResponse;
import com.example.app.entity.*;
import com.example.app.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ref")
@RequiredArgsConstructor
public class ReferenceController {
    private final AgentRepository          agentRepo;
    private final WarehouseStaffRepository warehouseStaffRepo;

    @GetMapping("/agents")
    public ApiResponse<List<Agent>> agents() { return ApiResponse.ok(agentRepo.findAll()); }

    @GetMapping("/warehouse-staffs")
    public ApiResponse<List<WarehouseStaff>> warehouseStaffs() { return ApiResponse.ok(warehouseStaffRepo.findAll()); }
}
