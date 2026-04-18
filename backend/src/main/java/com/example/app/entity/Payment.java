package com.example.app.entity;

import com.example.app.enums.PaymentMethod;
import com.example.app.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_order_id", unique = true)
    private SalesOrder salesOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    /** Số tiền thực tế cần thanh toán (admin có thể điền khi duyệt đơn) */
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    /** Ghi chú / nội dung chuyển khoản */
    @Column(length = 500)
    private String note;

    /** Thời điểm agent tạo yêu cầu thanh toán */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Thời điểm xác nhận đã thanh toán */
    private LocalDateTime paidAt;

    /** Manager đã xác nhận thanh toán (null nếu chưa xác nhận) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by")
    private Manager confirmedBy;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
