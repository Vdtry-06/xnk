package com.example.app.service;

import com.example.app.dto.request.CreateDeliveryNoteRequest;
import com.example.app.dto.response.DeliveryNoteResponse;
import com.example.app.entity.*;
import com.example.app.enums.OrderStatus;
import com.example.app.enums.PaymentMethod;
import com.example.app.enums.PaymentStatus;
import com.example.app.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeliveryNoteService {

    private final DeliveryNoteRepository    deliveryNoteRepository;
    private final DeliveryNoteItemRepository deliveryNoteItemRepository;
    private final SalesOrderRepository      salesOrderRepository;
    private final OrderItemRepository       orderItemRepository;
    private final WarehouseStaffRepository  staffRepository;
    private final PaymentRepository         paymentRepository;

    public List<DeliveryNoteResponse> getAll() {
        return deliveryNoteRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<DeliveryNoteResponse> getBySalesOrder(Long salesOrderId) {
        return deliveryNoteRepository.findBySalesOrderId(salesOrderId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DeliveryNoteResponse create(CreateDeliveryNoteRequest req) {
        SalesOrder so = salesOrderRepository.findById(req.salesOrderId())
                .orElseThrow(() -> new EntityNotFoundException("SalesOrder not found: " + req.salesOrderId()));

        if (so.getStatus() != OrderStatus.APPROVED && so.getStatus() != OrderStatus.PROCESSING)
            throw new IllegalStateException("Đơn hàng phải ở trạng thái APPROVED hoặc PROCESSING. Hiện: " + so.getStatus());

        Payment payment = paymentRepository.findBySalesOrderId(so.getId())
                .orElseThrow(() -> new IllegalStateException(
                        "Đơn hàng chưa có thông tin thanh toán. Đại lý cần tạo yêu cầu thanh toán trước."));

        boolean canDeliver = payment.getMethod() == PaymentMethod.CASH_ON_DELIVERY
                || payment.getStatus() == PaymentStatus.PAID;

        if (!canDeliver) {
            throw new IllegalStateException(
                    "Chưa đủ điều kiện xuất hàng. Đơn hàng dùng chuyển khoản cần được xác nhận đã thanh toán (PAID) trước khi xuất.");
        }

        Map<Long, Integer> requestQtyByOrderItem = new HashMap<>();
        for (CreateDeliveryNoteRequest.ItemRequest itemReq : req.deliveryNoteItems()) {
            requestQtyByOrderItem.merge(itemReq.orderItemId(), itemReq.deliveredQuantity(), Integer::sum);
        }

        Map<Long, OrderItem> orderItems = new HashMap<>();
        for (Long orderItemId : requestQtyByOrderItem.keySet()) {
            OrderItem item = orderItemRepository.findById(orderItemId)
                    .orElseThrow(() -> new EntityNotFoundException("OrderItem không tìm thấy: " + orderItemId));
            if (!item.getSalesOrder().getId().equals(so.getId()))
                throw new IllegalStateException("OrderItem không thuộc SalesOrder này: " + orderItemId);
            orderItems.put(orderItemId, item);
        }

        for (Map.Entry<Long, Integer> entry : requestQtyByOrderItem.entrySet()) {
            Long orderItemId = entry.getKey();
            int requestQty = entry.getValue();
            int alreadyDelivered = deliveryNoteItemRepository.sumDeliveredByOrderItem(orderItemId);
            int remaining = orderItems.get(orderItemId).getQuantity() - alreadyDelivered;
            if (requestQty > remaining) {
                throw new IllegalStateException(
                        "Số lượng xuất (" + requestQty + ") vượt quá số còn lại (" + remaining + ") cho OrderItem " + orderItemId);
            }
        }

        WarehouseStaff staff = staffRepository.findById(req.warehouseStaffId())
                .orElseThrow(() -> new EntityNotFoundException("WarehouseStaff not found: " + req.warehouseStaffId()));

        DeliveryNote note = DeliveryNote.builder()
                .salesOrder(so)
                .agent(so.getAgent())
                .warehouseStaff(staff)
                .trackingCode(req.trackingCode())
                .carrierName(req.carrierName())
                .shippingFee(req.shippingFee())
                .build();

        List<DeliveryNoteItem> noteItems = req.deliveryNoteItems().stream()
                .map(itemReq -> DeliveryNoteItem.builder()
                        .deliveryNote(note)
                        .orderItem(orderItems.get(itemReq.orderItemId()))
                        .deliveredQuantity(itemReq.deliveredQuantity())
                        .build())
                .toList();
        note.setItems(noteItems);
        deliveryNoteRepository.save(note);

        // Cập nhật trạng thái SalesOrder
        so.setStatus(OrderStatus.PROCESSING);
        // Kiểm tra tất cả items đã giao đủ chưa
        boolean allDelivered = so.getItems().stream().allMatch(oi -> {
            int delivered = deliveryNoteItemRepository.sumDeliveredByOrderItem(oi.getId());
            return delivered >= oi.getQuantity();
        });
        if (allDelivered) so.setStatus(OrderStatus.COMPLETED);
        salesOrderRepository.save(so);

        return toResponse(note);
    }

    private DeliveryNoteResponse toResponse(DeliveryNote n) {
        List<DeliveryNoteResponse.ItemResponse> itemResponses = n.getItems().stream()
                .map(i -> new DeliveryNoteResponse.ItemResponse(
                        i.getId(),
                        i.getOrderItem().getId(),
                        i.getOrderItem().getProductName(),
                        i.getDeliveredQuantity()))
                .toList();
        return new DeliveryNoteResponse(
                n.getId(),
                n.getSalesOrder().getId(),
                n.getAgent().getName(),
                n.getAgent().getCode(),
                n.getWarehouseStaff().getName(),
                n.getTrackingCode(), n.getCarrierName(),
                n.getShippingFee(), n.getCreatedAt(),
                itemResponses);
    }
}
