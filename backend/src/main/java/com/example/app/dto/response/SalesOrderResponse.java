package com.example.app.dto.response;
import com.example.app.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SalesOrderResponse(
    Long id, Long agentId, String agentName, String agentCode,
    BigDecimal totalEstimatedPrice, OrderStatus status,
    LocalDateTime createdAt,
    Long approvedById, String approvedByName,
    LocalDateTime approvedAt,
    List<ItemResponse> items
) {
    public record ItemResponse(Long id, String productName, String productLink,
                               Integer quantity, BigDecimal estimatedUnitPrice,
                               Integer remainingQuantity) {}
}
