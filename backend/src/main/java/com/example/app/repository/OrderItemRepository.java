package com.example.app.repository;
import com.example.app.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findBySalesOrderId(Long salesOrderId);
}
