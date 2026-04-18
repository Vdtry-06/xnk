package com.example.app.controller;
import com.example.app.dto.request.CreateDeliveryNoteRequest;
import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.DeliveryNoteResponse;
import com.example.app.service.DeliveryNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/delivery-notes")
@RequiredArgsConstructor
public class DeliveryNoteController {
    private final DeliveryNoteService service;

    @GetMapping
    public ApiResponse<List<DeliveryNoteResponse>> getAll() {
        return ApiResponse.ok(service.getAll());
    }

    @GetMapping("/by-sales-order/{salesOrderId}")
    public ApiResponse<List<DeliveryNoteResponse>> getBySalesOrder(@PathVariable Long salesOrderId) {
        return ApiResponse.ok(service.getBySalesOrder(salesOrderId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('WAREHOUSE_STAFF')")
    public ApiResponse<DeliveryNoteResponse> create(@Valid @RequestBody CreateDeliveryNoteRequest req) {
        return ApiResponse.ok("Tạo phiếu xuất thành công", service.create(req));
    }
}
