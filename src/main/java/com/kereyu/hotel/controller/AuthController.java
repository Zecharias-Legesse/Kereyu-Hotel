package com.kereyu.hotel.controller;

import com.kereyu.hotel.dto.AuthDTO;
import com.kereyu.hotel.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.JwtResponse> login(@Valid @RequestBody AuthDTO.LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.login(loginRequest));
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.MessageResponse> register(@Valid @RequestBody AuthDTO.SignupRequest signupRequest) {
        return ResponseEntity.ok(authService.register(signupRequest));
    }

    @PostMapping("/firebase")
    public ResponseEntity<AuthDTO.JwtResponse> firebaseLogin(@Valid @RequestBody AuthDTO.FirebaseTokenRequest firebaseRequest) {
        return ResponseEntity.ok(authService.loginWithFirebase(firebaseRequest));
    }
}
