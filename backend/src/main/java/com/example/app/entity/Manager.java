package com.example.app.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "managers")
@DiscriminatorValue("ADMIN")
@Getter @Setter @NoArgsConstructor
public class Manager extends User {}
