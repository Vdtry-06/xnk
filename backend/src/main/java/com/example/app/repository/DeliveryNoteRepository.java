package com.example.app.repository;
import com.example.app.entity.DeliveryNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryNoteRepository extends JpaRepository<DeliveryNote, Long> {
    List<DeliveryNote> findBySalesOrderId(Long salesOrderId);
    List<DeliveryNote> findByAgentId(Long agentId);
}
