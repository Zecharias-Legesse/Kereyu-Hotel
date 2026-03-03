package com.kereyu.hotel.controller;

import com.kereyu.hotel.dto.ReservationDTO;
import com.kereyu.hotel.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReservationController {
    
    @Autowired
    private ReservationService reservationService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReservationDTO.ReservationResponse> createReservation(
            @Valid @RequestBody ReservationDTO.ReservationRequest request) {
        return new ResponseEntity<>(reservationService.createReservation(request), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReservationDTO.ReservationResponse> updateReservation(
            @PathVariable Long id, @Valid @RequestBody ReservationDTO.ReservationRequest request) {
        return ResponseEntity.ok(reservationService.updateReservation(id, request));
    }
    
    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservationDTO.ReservationResponse> approveReservation(
            @PathVariable Long id, @RequestBody ReservationDTO.ReservationApproval approval) {
        return ResponseEntity.ok(reservationService.approveReservation(id, approval));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<Void> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ReservationDTO.ReservationResponse> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReservationDTO.ReservationResponse>> getAllReservations(Pageable pageable) {
        return ResponseEntity.ok(reservationService.getAllReservations(pageable));
    }
    
    @GetMapping("/my-reservations")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Page<ReservationDTO.ReservationResponse>> getMyReservations(Pageable pageable) {
        return ResponseEntity.ok(reservationService.getMyReservations(pageable));
    }
}
