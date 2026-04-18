package com.example.app.dto.response;

import com.example.app.enums.PaymentMethod;
import com.example.app.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
    Long id,
    Long salesOrderId,
    PaymentMethod method,
    PaymentStatus status,
    BigDecimal amount,
    String note,
    LocalDateTime createdAt,
    LocalDateTime paidAt,
    Long confirmedById,
    String confirmedByName
) {}
