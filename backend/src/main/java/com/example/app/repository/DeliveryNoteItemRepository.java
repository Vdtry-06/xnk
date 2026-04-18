package com.example.app.repository;

import com.example.app.entity.DeliveryNoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeliveryNoteItemRepository extends JpaRepository<DeliveryNoteItem, Long> {
    @Query("SELECT COALESCE(SUM(i.deliveredQuantity), 0) FROM DeliveryNoteItem i WHERE i.orderItem.id = :orderItemId")
    int sumDeliveredByOrderItem(@Param("orderItemId") Long orderItemId);
}
