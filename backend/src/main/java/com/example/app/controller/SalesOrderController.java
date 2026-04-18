package com.example.app.controller;
import com.example.app.dto.request.CreateSalesOrderRequest;
import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.SalesOrderResponse;
import com.example.app.enums.OrderStatus;
import com.example.app.service.SalesOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@RequiredArgsConstructor
public class SalesOrderController {
    private final SalesOrderService service;

    @GetMapping
    public ApiResponse<List<SalesOrderResponse>> getAll(
            @RequestParam(required = false) OrderStatus status) {
        return ApiResponse.ok(status != null ? service.getByStatus(status) : service.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<SalesOrderResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(service.getById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SalesOrderResponse> create(@Valid @RequestBody CreateSalesOrderRequest req) {
        return ApiResponse.ok("Đặt hàng thành công", service.create(req));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<SalesOrderResponse> approve(
            @PathVariable Long id,
            @RequestParam Long managerId) {
        return ApiResponse.ok("Đã duyệt", service.approve(id, managerId));
    }
}
