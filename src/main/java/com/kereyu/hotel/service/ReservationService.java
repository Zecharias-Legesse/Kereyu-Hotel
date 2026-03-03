package com.kereyu.hotel.service;

import com.kereyu.hotel.dto.ReservationDTO;
import com.kereyu.hotel.exception.BadRequestException;
import com.kereyu.hotel.exception.ResourceNotFoundException;
import com.kereyu.hotel.model.Reservation;
import com.kereyu.hotel.model.Room;
import com.kereyu.hotel.model.User;
import com.kereyu.hotel.repository.ReservationRepository;
import com.kereyu.hotel.repository.RoomRepository;
import com.kereyu.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@Transactional
public class ReservationService {
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public ReservationDTO.ReservationResponse createReservation(ReservationDTO.ReservationRequest request) {
        User user;
        if (request.getUserId() != null) {
            // Admin assigning reservation to a specific user
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        } else {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));
        
        // Validate dates
        if (request.getCheckInDate().isBefore(java.time.LocalDate.now())) {
            throw new BadRequestException("Check-in date cannot be in the past");
        }
        if (request.getCheckOutDate().isBefore(request.getCheckInDate())) {
            throw new BadRequestException("Check-out date must be after check-in date");
        }
        
        // Check for conflicting reservations
        if (reservationRepository.existsConflictingReservation(
                room.getId(), request.getCheckInDate(), request.getCheckOutDate())) {
            throw new BadRequestException("Room is not available for the selected dates");
        }

        // Calculate total amount
        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(days));

        Reservation reservation = new Reservation();
        reservation.setReservationNumber(generateReservationNumber());
        reservation.setUser(user);
        reservation.setRoom(room);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setTotalAmount(totalAmount);
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setStatus(Reservation.ReservationStatus.PENDING);
        reservation.setPaymentStatus(Reservation.PaymentStatus.UNPAID);
        
        Reservation savedReservation = reservationRepository.save(reservation);
        return mapToResponse(savedReservation);
    }
    
    public ReservationDTO.ReservationResponse approveReservation(Long id, ReservationDTO.ReservationApproval approval) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        
        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING) {
            throw new BadRequestException("Only pending reservations can be approved or rejected");
        }
        
        reservation.setStatus(approval.getStatus());
        reservation.setApprovedBy(approver);
        reservation.setApprovedAt(LocalDateTime.now());
        
        if (approval.getStatus() == Reservation.ReservationStatus.CONFIRMED) {
            reservation.getRoom().setStatus(Room.RoomStatus.OCCUPIED);
            roomRepository.save(reservation.getRoom());
        }
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        return mapToResponse(updatedReservation);
    }
    
    public ReservationDTO.ReservationResponse updateReservation(Long id, ReservationDTO.ReservationRequest request) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        
        if (reservation.getStatus() != Reservation.ReservationStatus.PENDING) {
            throw new BadRequestException("Only pending reservations can be updated");
        }
        
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + request.getRoomId()));

        // Check for conflicting reservations (exclude current reservation)
        if (reservationRepository.existsConflictingReservation(
                room.getId(), request.getCheckInDate(), request.getCheckOutDate())
                && (!room.getId().equals(reservation.getRoom().getId())
                || !request.getCheckInDate().equals(reservation.getCheckInDate())
                || !request.getCheckOutDate().equals(reservation.getCheckOutDate()))) {
            throw new BadRequestException("Room is not available for the selected dates");
        }

        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalAmount = room.getPricePerNight().multiply(BigDecimal.valueOf(days));

        reservation.setRoom(room);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setTotalAmount(totalAmount);
        reservation.setSpecialRequests(request.getSpecialRequests());
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        return mapToResponse(updatedReservation);
    }
    
    public void cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        if (reservation.getRoom().getStatus() == Room.RoomStatus.OCCUPIED) {
            reservation.getRoom().setStatus(Room.RoomStatus.AVAILABLE);
            roomRepository.save(reservation.getRoom());
        }
        reservationRepository.save(reservation);
    }
    
    public ReservationDTO.ReservationResponse getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        return mapToResponse(reservation);
    }
    
    public Page<ReservationDTO.ReservationResponse> getAllReservations(Pageable pageable) {
        return reservationRepository.findAll(pageable).map(this::mapToResponse);
    }
    
    public Page<ReservationDTO.ReservationResponse> getMyReservations(Pageable pageable) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return reservationRepository.findByUserId(user.getId(), pageable).map(this::mapToResponse);
    }
    
    private String generateReservationNumber() {
        return "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private ReservationDTO.ReservationResponse mapToResponse(Reservation reservation) {
        ReservationDTO.ReservationResponse response = new ReservationDTO.ReservationResponse();
        response.setId(reservation.getId());
        response.setReservationNumber(reservation.getReservationNumber());
        response.setUserId(reservation.getUser().getId());
        response.setUserName(reservation.getUser().getFullName());
        response.setRoomId(reservation.getRoom().getId());
        response.setRoomNumber(reservation.getRoom().getRoomNumber());
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setNumberOfGuests(reservation.getNumberOfGuests());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setStatus(reservation.getStatus());
        response.setPaymentStatus(reservation.getPaymentStatus());
        response.setSpecialRequests(reservation.getSpecialRequests());
        return response;
    }
}
