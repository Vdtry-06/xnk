package com.example.app.repository;

import com.example.app.entity.Agent;
import com.example.app.entity.Manager;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ManagerRepository extends JpaRepository<Manager, Long> {

    Optional<Manager> findByUsername(String username);}
