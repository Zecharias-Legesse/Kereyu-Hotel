package com.kereyu.hotel.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.kereyu.hotel.dto.AuthDTO;
import com.kereyu.hotel.exception.BadRequestException;
import com.kereyu.hotel.model.Role;
import com.kereyu.hotel.model.User;
import com.kereyu.hotel.repository.RoleRepository;
import com.kereyu.hotel.repository.UserRepository;
import com.kereyu.hotel.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    public AuthDTO.JwtResponse login(AuthDTO.LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        org.springframework.security.core.userdetails.UserDetails userDetails = 
            (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
        
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        
        return new AuthDTO.JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roles);
    }
    
    public AuthDTO.MessageResponse register(AuthDTO.SignupRequest signupRequest) {
        if (userRepository.existsByUsername(signupRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        
        User user = new User();
        user.setUsername(signupRequest.getUsername());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());

        Set<Role> roles = new HashSet<>();
        Role customerRole = roleRepository.findByName(Role.RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(customerRole);
        user.setRoles(roles);
        userRepository.save(user);
        
        return new AuthDTO.MessageResponse("User registered successfully!");
    }

    public AuthDTO.JwtResponse loginWithFirebase(AuthDTO.FirebaseTokenRequest request) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            String firebaseUid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();

            // 1. Try to find by Firebase UID
            User user = userRepository.findByFirebaseUid(firebaseUid).orElse(null);

            // 2. If not found, try by email (link existing account)
            if (user == null) {
                user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    user.setFirebaseUid(firebaseUid);
                    userRepository.save(user);
                }
            }

            // 3. If still not found, create new user
            if (user == null) {
                user = new User();
                user.setFirebaseUid(firebaseUid);
                user.setEmail(email);
                user.setUsername(generateUniqueUsername(email));
                user.setFullName(name != null ? name : email.split("@")[0]);
                user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));

                Set<Role> roles = new HashSet<>();
                Role customerRole = roleRepository.findByName(Role.RoleName.ROLE_CUSTOMER)
                        .orElseThrow(() -> new RuntimeException("Error: Role not found."));
                roles.add(customerRole);
                user.setRoles(roles);
                user = userRepository.save(user);
            }

            // 4. Generate local JWT
            String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());

            Set<String> roleNames = user.getRoles().stream()
                    .map(r -> r.getName().name())
                    .collect(Collectors.toSet());

            return new AuthDTO.JwtResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), roleNames);
        } catch (FirebaseAuthException e) {
            throw new BadRequestException("Invalid Firebase token: " + e.getMessage());
        }
    }

    private String generateUniqueUsername(String email) {
        String base = email.split("@")[0];
        String username = base;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = base + counter++;
        }
        return username;
    }
}
