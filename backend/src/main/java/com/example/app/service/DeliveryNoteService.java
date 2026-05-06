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
import java.util.ArrayList;
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
        List<DeliveryNote> deliveryNotes = deliveryNoteRepository.findAll();
        List<DeliveryNoteResponse> responses = new ArrayList<>();

        for (DeliveryNote deliveryNote : deliveryNotes) {
            responses.add(toResponse(deliveryNote));
        }

        return responses;
    }

    public List<DeliveryNoteResponse> getBySalesOrder(Long salesOrderId) {
        List<DeliveryNote> deliveryNotes = deliveryNoteRepository.findBySalesOrderId(salesOrderId);
        List<DeliveryNoteResponse> responses = new ArrayList<>();

        for (DeliveryNote deliveryNote : deliveryNotes) {
            responses.add(toResponse(deliveryNote));
        }

        return responses;
    }

    @Transactional
    public DeliveryNoteResponse create(CreateDeliveryNoteRequest req) {
        SalesOrder salesOrder = salesOrderRepository.findById(req.salesOrderId())
                .orElseThrow(() -> new EntityNotFoundException("SalesOrder not found: " + req.salesOrderId()));

        OrderStatus currentStatus = salesOrder.getStatus();
        if (currentStatus != OrderStatus.APPROVED && currentStatus != OrderStatus.PROCESSING) {
            throw new IllegalStateException("Đơn hàng phải ở trạng thái APPROVED hoặc PROCESSING. Hiện: " + currentStatus);
        }

        Payment payment = paymentRepository.findBySalesOrderId(salesOrder.getId())
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
            if (!item.getSalesOrder().getId().equals(salesOrder.getId())) {
                throw new IllegalStateException("OrderItem không thuộc SalesOrder này: " + orderItemId);
            }
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

        WarehouseStaff warehouseStaff = staffRepository.findById(req.warehouseStaffId())
                .orElseThrow(() -> new EntityNotFoundException("WarehouseStaff not found: " + req.warehouseStaffId()));

        DeliveryNote note = DeliveryNote.builder()
                .salesOrder(salesOrder)
                .agent(salesOrder.getAgent())
                .warehouseStaff(warehouseStaff)
                .trackingCode(req.trackingCode())
                .carrierName(req.carrierName())
                .shippingFee(req.shippingFee())
                .build();

        List<DeliveryNoteItem> noteItems = new ArrayList<>();
        for (CreateDeliveryNoteRequest.ItemRequest itemReq : req.deliveryNoteItems()) {
            DeliveryNoteItem noteItem = DeliveryNoteItem.builder()
                    .deliveryNote(note)
                    .orderItem(orderItems.get(itemReq.orderItemId()))
                    .deliveredQuantity(itemReq.deliveredQuantity())
                    .build();
            noteItems.add(noteItem);
        }

        note.setItems(noteItems);
        deliveryNoteRepository.save(note);

        salesOrder.setStatus(OrderStatus.PROCESSING);

        boolean allDelivered = true;
        for (OrderItem orderItem : salesOrder.getItems()) {
            int delivered = deliveryNoteItemRepository.sumDeliveredByOrderItem(orderItem.getId());
            if (delivered < orderItem.getQuantity()) {
                allDelivered = false;
                break;
            }
        }

        if (allDelivered) {
            salesOrder.setStatus(OrderStatus.COMPLETED);
        }
        salesOrderRepository.save(salesOrder);

        return toResponse(note);
    }

    private DeliveryNoteResponse toResponse(DeliveryNote deliveryNote) {
        List<DeliveryNoteResponse.ItemResponse> itemResponses = new ArrayList<>();
        for (DeliveryNoteItem item : deliveryNote.getItems()) {
            DeliveryNoteResponse.ItemResponse itemResponse = new DeliveryNoteResponse.ItemResponse(
                    item.getId(),
                    item.getOrderItem().getId(),
                    item.getOrderItem().getProductName(),
                    item.getDeliveredQuantity());
            itemResponses.add(itemResponse);
        }

        return new DeliveryNoteResponse(
                deliveryNote.getId(),
                deliveryNote.getSalesOrder().getId(),
                deliveryNote.getAgent().getName(),
                deliveryNote.getAgent().getCode(),
                deliveryNote.getWarehouseStaff().getName(),
                deliveryNote.getTrackingCode(),
                deliveryNote.getCarrierName(),
                deliveryNote.getShippingFee(),
                deliveryNote.getCreatedAt(),
                itemResponses);
    }
}
