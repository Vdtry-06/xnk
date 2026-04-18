package com.example.app.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateDeliveryNoteRequest(
    @NotNull Long salesOrderId,
    @NotNull Long warehouseStaffId,
    @NotEmpty List<@Valid ItemRequest> deliveryNoteItems,
    String trackingCode,
    String carrierName,
    @DecimalMin("0") BigDecimal shippingFee
) {
    public record ItemRequest(
        @NotNull Long orderItemId,
        @NotNull @Min(1) Integer deliveredQuantity
    ) {}
}
