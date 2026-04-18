package com.example.app.dto.response;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DeliveryNoteResponse(
    Long id,
    Long salesOrderId,
    String agentName, String agentCode,
    String warehouseStaffName,
    String trackingCode, String carrierName,
    BigDecimal shippingFee, LocalDateTime createdAt,
    List<ItemResponse> deliveryNoteItems
) {
    public record ItemResponse(
        Long id,
        Long orderItemId,
        String productName,
        Integer deliveredQuantity
    ) {}
}
