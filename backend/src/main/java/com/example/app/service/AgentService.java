package com.example.app.service;

import com.example.app.dto.request.CreateAgentRequest;
import com.example.app.dto.response.AgentResponse;
import com.example.app.entity.Agent;
import com.example.app.entity.Manager;
import com.example.app.enums.Role;
import com.example.app.repository.AgentRepository;
import com.example.app.repository.ManagerRepository;
import com.example.app.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentService {

    private final AgentRepository agentRepository;
    private final ManagerRepository managerRepository;
    private final UserRepository  userRepository;

    public List<AgentResponse> getAll() {
        return agentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AgentResponse create(CreateAgentRequest req) {
        if (userRepository.findByUsername(req.username()).isPresent())
            throw new IllegalArgumentException("Username đã tồn tại: " + req.username());
        if (agentRepository.existsByCode(req.code()))
            throw new IllegalArgumentException("Mã đại lý đã tồn tại: " + req.code());
        Manager manager = managerRepository.findById(req.managerId())
                .orElseThrow(() -> new EntityNotFoundException("Manager not found: " + req.managerId()));

        Agent agent = new Agent();
        agent.setUsername(req.username());
        agent.setPassword(req.password());
        agent.setRole(Role.AGENT);
        agent.setCode(req.code());
        agent.setName(req.name());
        agent.setPhone(req.phone());
        agent.setAddress(req.address());
        agent.setManager(manager);
        return toResponse(agentRepository.save(agent));
    }

    private AgentResponse toResponse(Agent a) {
        return new AgentResponse(
                a.getId(),
                a.getUsername(),
                a.getCode(),
                a.getName(),
                a.getPhone(),
                a.getAddress(),
                a.getManager() != null ? a.getManager().getId() : null,
                a.getManager() != null ? a.getManager().getUsername() : null
        );
    }
}
