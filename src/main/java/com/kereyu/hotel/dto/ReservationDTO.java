package com.kereyu.hotel.dto;

import com.kereyu.hotel.model.Reservation;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReservationDTO {

    @Data
    public static class ReservationRequest {
        @NotNull(message = "Room ID is required")
        private Long roomId;

        @NotNull(message = "Check-in date is required")
        @FutureOrPresent(message = "Check-in date must be today or in the future")
        private LocalDate checkInDate;

        @NotNull(message = "Check-out date is required")
        @Future(message = "Check-out date must be in the future")
        private LocalDate checkOutDate;

        @NotNull(message = "Number of guests is required")
        @Min(value = 1, message = "At least 1 guest is required")
        private Integer numberOfGuests;

        @Size(max = 1000, message = "Special requests must be under 1000 characters")
        private String specialRequests;

        // Optional: admin can assign reservation to a specific user
        private Long userId;
    }
    
    @Data
    public static class ReservationResponse {
        private Long id;
        private String reservationNumber;
        private Long userId;
        private String userName;
        private Long roomId;
        private String roomNumber;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer numberOfGuests;
        private BigDecimal totalAmount;
        private Reservation.ReservationStatus status;
        private Reservation.PaymentStatus paymentStatus;
        private String specialRequests;
    }
    
    @Data
    public static class ReservationApproval {
        @NotNull(message = "Status is required")
        private Reservation.ReservationStatus status;
    }
}
