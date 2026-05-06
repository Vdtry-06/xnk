package com.example.app.service;

import com.example.app.dto.request.CreatePaymentRequest;
import com.example.app.dto.response.PaymentResponse;
import com.example.app.entity.Manager;
import com.example.app.entity.Payment;
import com.example.app.entity.SalesOrder;
import com.example.app.enums.OrderStatus;
import com.example.app.enums.PaymentStatus;
import com.example.app.repository.ManagerRepository;
import com.example.app.repository.PaymentRepository;
import com.example.app.repository.SalesOrderRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final ManagerRepository managerRepository;

    @Transactional
    public PaymentResponse create(CreatePaymentRequest req) {
        SalesOrder order = salesOrderRepository.findById(req.salesOrderId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đơn hàng: " + req.salesOrderId()));

        if (order.getStatus() != OrderStatus.APPROVED) {
            throw new IllegalStateException("Chỉ có thể tạo thanh toán cho đơn hàng đã được DUYỆT. " +
                    "Trạng thái hiện tại: " + order.getStatus());
        }

        if (paymentRepository.existsBySalesOrderId(req.salesOrderId())) {
            throw new IllegalStateException("Đơn hàng này đã có yêu cầu thanh toán.");
        }

        Payment payment = Payment.builder()
                .salesOrder(order)
                .method(req.method())
                .amount(req.amount() != null ? req.amount() : order.getTotalEstimatedPrice())
                .note(req.note())
                .status(PaymentStatus.PENDING)
                .build();

        return toResponse(paymentRepository.save(payment));
    }

    public PaymentResponse getBySalesOrderId(Long salesOrderId) {
        return paymentRepository.findBySalesOrderId(salesOrderId)
                .map(this::toResponse)
                .orElse(null);
    }

    public List<PaymentResponse> getAll() {
        return paymentRepository.findAll()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public PaymentResponse confirmPaid(Long paymentId, Long managerId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy payment: " + paymentId));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalStateException("Chỉ xác nhận được payment ở trạng thái PENDING.");
        }

        Manager manager = managerRepository.findById(managerId)
                .orElseThrow(() -> new EntityNotFoundException("Manager not found: " + managerId));

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setConfirmedBy(manager);

        SalesOrder order = payment.getSalesOrder();
        order.setStatus(OrderStatus.PROCESSING);
        salesOrderRepository.save(order);

        return toResponse(paymentRepository.save(payment));
    }

    private PaymentResponse toResponse(Payment p) {
        Long confirmedById = p.getConfirmedBy() != null ? p.getConfirmedBy().getId() : null;
        String confirmedByName = p.getConfirmedBy() != null ? p.getConfirmedBy().getUsername() : null;
        return new PaymentResponse(
                p.getId(),
                p.getSalesOrder().getId(),
                p.getMethod(),
                p.getStatus(),
                p.getAmount(),
                p.getNote(),
                p.getCreatedAt(),
                p.getPaidAt(),
                confirmedById,
                confirmedByName
        );
    }
}
