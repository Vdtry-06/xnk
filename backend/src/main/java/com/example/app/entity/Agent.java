package com.example.app.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "agents")
@DiscriminatorValue("AGENT")
@Getter @Setter @NoArgsConstructor
public class Agent extends User {

    @Column(nullable = false, unique = true)
    private String code;         // mã đại lý, vd: AG001

    @Column(nullable = false)
    private String name;

    private String phone;
    private String address;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private Manager manager;
}
