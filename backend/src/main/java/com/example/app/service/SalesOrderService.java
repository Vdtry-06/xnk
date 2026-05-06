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
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository   salesOrderRepository;
    private final AgentRepository        agentRepository;
    private final DeliveryNoteItemRepository deliveryNoteItemRepository;
    private final ManagerRepository      managerRepository;

    public List<SalesOrderResponse> getAll() {
        List<SalesOrder> salesOrders = salesOrderRepository.findAllByOrderByCreatedAtDesc();
        List<SalesOrderResponse> responses = new ArrayList<>();

        for (SalesOrder salesOrder : salesOrders) {
            responses.add(toResponse(salesOrder));
        }

        return responses;
    }

    public List<SalesOrderResponse> getByStatus(OrderStatus status) {
        List<SalesOrder> salesOrders = salesOrderRepository.findByStatus(status);
        List<SalesOrderResponse> responses = new ArrayList<>();

        for (SalesOrder salesOrder : salesOrders) {
            responses.add(toResponse(salesOrder));
        }

        return responses;
    }

    public SalesOrderResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Transactional
    public SalesOrderResponse create(CreateSalesOrderRequest req) {
        Agent agent = agentRepository.findById(req.agentId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy id đại lý: " + req.agentId()));

        SalesOrder order = SalesOrder.builder().agent(agent).build();

        List<OrderItem> items = new ArrayList<>();
        for (var r : req.items()) {
            OrderItem item = OrderItem.builder()
                    .salesOrder(order)
                    .productName(r.productName())
                    .productLink(r.productLink())
                    .quantity(r.quantity())
                    .estimatedUnitPrice(r.estimatedUnitPrice())
                    .build();
            items.add(item);
        }
        order.setItems(items);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : items) {
            if (item.getEstimatedUnitPrice() != null) {
                total = total.add(item.getEstimatedUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        order.setTotalEstimatedPrice(total);

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
        List<SalesOrderResponse.ItemResponse> items = new ArrayList<>();
        for (OrderItem i : o.getItems()) {
            int delivered = deliveryNoteItemRepository.sumDeliveredByOrderItem(i.getId());
            int remaining = Math.max(0, i.getQuantity() - delivered);
            items.add(new SalesOrderResponse.ItemResponse(
                    i.getId(), i.getProductName(), i.getProductLink(),
                    i.getQuantity(), i.getEstimatedUnitPrice(), remaining));
        }

        Long approvedById     = o.getApprovedBy() != null ? o.getApprovedBy().getId()          : null;
        String approvedByName = o.getApprovedBy() != null ? o.getApprovedBy().getUsername()    : null;

        return new SalesOrderResponse(
                o.getId(), o.getAgent().getId(), o.getAgent().getName(),
                o.getAgent().getCode(), o.getTotalEstimatedPrice(), o.getStatus(),
                o.getCreatedAt(),
                approvedById, approvedByName, o.getApprovedAt(),
                items);
    }
}
