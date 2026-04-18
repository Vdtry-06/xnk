package com.example.app.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivery_notes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeliveryNote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_order_id")
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "warehouse_staff_id")
    private WarehouseStaff warehouseStaff;

    private String trackingCode;
    private String carrierName;

    @Column(precision = 15, scale = 2)
    private BigDecimal shippingFee;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "deliveryNote", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DeliveryNoteItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() { createdAt = LocalDateTime.now(); }
}
