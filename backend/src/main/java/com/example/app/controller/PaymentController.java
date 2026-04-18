package com.example.app.controller;

import com.example.app.dto.request.CreatePaymentRequest;
import com.example.app.dto.response.ApiResponse;
import com.example.app.dto.response.PaymentResponse;
import com.example.app.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /** Lấy tất cả payments (admin) */
    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAll() {
        return ApiResponse.ok(paymentService.getAll());
    }

    /** Lấy payment theo sales_order_id */
    @GetMapping("/by-sales-order/{salesOrderId}")
    public ApiResponse<PaymentResponse> getBySalesOrder(@PathVariable Long salesOrderId) {
        return ApiResponse.ok(paymentService.getBySalesOrderId(salesOrderId));
    }

    /** Agent tạo thanh toán cho đơn hàng đã được duyệt */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponse> create(@Valid @RequestBody CreatePaymentRequest req) {
        return ApiResponse.ok("Đã tạo yêu cầu thanh toán", paymentService.create(req));
    }

    /** Manager xác nhận đã nhận tiền */
    @PatchMapping("/{id}/confirm-paid")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<PaymentResponse> confirmPaid(
            @PathVariable Long id,
            @RequestParam Long managerId) {
        return ApiResponse.ok("Xác nhận thanh toán thành công", paymentService.confirmPaid(id, managerId));
    }

}
