package com.example.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "warehouse_staffs")
@DiscriminatorValue("WAREHOUSE_STAFF")
@Getter @Setter @NoArgsConstructor
public class WarehouseStaff extends User {

    @Column(nullable = false)
    private String name;
}
