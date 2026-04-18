package com.example.app.dto.request;

import com.example.app.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreatePaymentRequest(
    @NotNull Long salesOrderId,
    @NotNull PaymentMethod method,
    BigDecimal amount,
    String note
) {}
