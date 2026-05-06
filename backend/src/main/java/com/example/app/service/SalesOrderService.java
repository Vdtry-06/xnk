package com.example.app.service;

import com.example.app.dto.request.CreateSalesOrderRequest;
import com.example.app.dto.response.SalesOrderResponse;
import com.example.app.entity.*;
import com.example.app.enums.OrderStatus;
import com.example.app.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository   salesOrderRepository;
    private final AgentRepository        agentRepository;
    private final DeliveryNoteItemRepository deliveryNoteItemRepository;
    private final ManagerRepository      managerRepository;

    public List<SalesOrderResponse> getAll() {
        return salesOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<SalesOrderResponse> getByStatus(OrderStatus status) {
        return salesOrderRepository.findByStatus(status)
                .stream().map(this::toResponse).toList();
    }

    public SalesOrderResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public SalesOrderResponse create(CreateSalesOrderRequest req) {
        Agent agent = agentRepository.findById(req.agentId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy id đại lý: " + req.agentId()));

        SalesOrder order = SalesOrder.builder().agent(agent).build();

        List<OrderItem> items = req.items().stream().map(r -> OrderItem.builder()
                .salesOrder(order)
                .productName(r.productName())
                .productLink(r.productLink())
                .quantity(r.quantity())
                .estimatedUnitPrice(r.estimatedUnitPrice())
                .build()).toList();

        order.setItems(items);
        order.setTotalEstimatedPrice(items.stream()
                .filter(i -> i.getEstimatedUnitPrice() != null)
                .map(i -> i.getEstimatedUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        return toResponse(salesOrderRepository.save(order));
    }

    @Transactional
    public SalesOrderResponse approve(Long id, Long managerId) {
        SalesOrder o = findOrThrow(id);
        if (o.getStatus() != OrderStatus.PENDING)
            throw new IllegalStateException("Chỉ duyệt được đơn PENDING. Hiện tại: " + o.getStatus());

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new EntityNotFoundException("Manager not found: " + managerId));

        o.setStatus(OrderStatus.APPROVED);
        o.setApprovedBy(manager);
        o.setApprovedAt(LocalDateTime.now());
        return toResponse(salesOrderRepository.save(o));
    }

    private SalesOrder findOrThrow(Long id) {
        return salesOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("SalesOrder not found: " + id));
    }

    private SalesOrderResponse toResponse(SalesOrder o) {
        List<SalesOrderResponse.ItemResponse> items = o.getItems().stream().map(i -> {
            int delivered = deliveryNoteItemRepository.sumDeliveredByOrderItem(i.getId());
            int remaining = Math.max(0, i.getQuantity() - delivered);
            return new SalesOrderResponse.ItemResponse(
                    i.getId(), i.getProductName(), i.getProductLink(),
                    i.getQuantity(), i.getEstimatedUnitPrice(), remaining);
        }).toList();

        Long approvedById = o.getApprovedBy() != null ? o.getApprovedBy().getId() : null;
        String approvedByName = o.getApprovedBy() != null ? o.getApprovedBy().getUsername() : null;

        return new SalesOrderResponse(
                o.getId(), o.getAgent().getId(), o.getAgent().getName(),
                o.getAgent().getCode(), o.getTotalEstimatedPrice(), o.getStatus(),
                o.getCreatedAt(),
                approvedById, approvedByName, o.getApprovedAt(),
                items);
    }
}
