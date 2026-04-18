package com.example.app.repository;

import com.example.app.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findBySalesOrderId(Long salesOrderId);
    boolean existsBySalesOrderId(Long salesOrderId);
}
