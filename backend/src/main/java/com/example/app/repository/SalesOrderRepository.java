package com.example.app.repository;
import com.example.app.entity.SalesOrder;
import com.example.app.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {
    List<SalesOrder> findByAgentId(Long agentId);
    List<SalesOrder> findByStatus(OrderStatus status);
    List<SalesOrder> findAllByOrderByCreatedAtDesc();
}
