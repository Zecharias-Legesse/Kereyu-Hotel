package com.kereyu.hotel.controller;

import com.kereyu.hotel.dto.AuthDTO;
import com.kereyu.hotel.model.User;
import com.kereyu.hotel.repository.UserRepository;
import com.kereyu.hotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<UserSummary>> getAllUsers() {
        List<UserSummary> users = userRepository.findAll().stream()
                .map(u -> new UserSummary(u.getId(), u.getUsername(), u.getFullName(), u.getEmail()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<AuthDTO.MessageResponse> createUser(@Valid @RequestBody AuthDTO.SignupRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    public record UserSummary(Long id, String username, String fullName, String email) {}
}
