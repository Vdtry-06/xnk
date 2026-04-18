package com.example.app.dto.request;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record CreateSalesOrderRequest(
    @NotNull Long agentId,
    @NotEmpty @Valid List<ItemRequest> items
) {
    public record ItemRequest(
        @NotBlank String productName,
        String productLink,
        @NotNull @Min(1) Integer quantity,
        @DecimalMin("0") BigDecimal estimatedUnitPrice
    ) {}
}
