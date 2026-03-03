package com.kereyu.hotel.service;

import com.kereyu.hotel.exception.BadRequestException;
import com.kereyu.hotel.exception.ResourceNotFoundException;
import com.kereyu.hotel.model.Payment;
import com.kereyu.hotel.model.Reservation;
import com.kereyu.hotel.repository.PaymentRepository;
import com.kereyu.hotel.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public PaymentResponse createPayment(PaymentRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + request.getReservationId()));

        if (reservation.getStatus() == Reservation.ReservationStatus.CANCELLED ||
                reservation.getStatus() == Reservation.ReservationStatus.REJECTED) {
            throw new BadRequestException("Cannot make payment for a cancelled or rejected reservation");
        }

        if (reservation.getPaymentStatus() == Reservation.PaymentStatus.PAID) {
            throw new BadRequestException("Reservation is already fully paid");
        }

        BigDecimal totalPaid = paymentRepository.findByReservationId(reservation.getId()).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = reservation.getTotalAmount().subtract(totalPaid);
        if (request.getAmount().compareTo(remaining) > 0) {
            throw new BadRequestException("Payment amount exceeds remaining balance of " + remaining);
        }

        Payment payment = new Payment();
        payment.setReservation(reservation);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(generateTransactionId());
        payment.setStatus(Payment.PaymentStatus.COMPLETED);

        Payment savedPayment = paymentRepository.save(payment);

        // Update reservation payment status
        BigDecimal newTotalPaid = totalPaid.add(request.getAmount());
        if (newTotalPaid.compareTo(reservation.getTotalAmount()) >= 0) {
            reservation.setPaymentStatus(Reservation.PaymentStatus.PAID);
        } else {
            reservation.setPaymentStatus(Reservation.PaymentStatus.PARTIAL);
        }
        reservationRepository.save(reservation);

        return mapToResponse(savedPayment);
    }

    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new BadRequestException("Only completed payments can be refunded");
        }

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        Payment updatedPayment = paymentRepository.save(payment);

        // Recalculate reservation payment status
        Reservation reservation = payment.getReservation();
        BigDecimal totalPaid = paymentRepository.findByReservationId(reservation.getId()).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            reservation.setPaymentStatus(Reservation.PaymentStatus.REFUNDED);
        } else if (totalPaid.compareTo(reservation.getTotalAmount()) < 0) {
            reservation.setPaymentStatus(Reservation.PaymentStatus.PARTIAL);
        }
        reservationRepository.save(reservation);

        return mapToResponse(updatedPayment);
    }

    public List<PaymentResponse> getPaymentsByReservation(Long reservationId) {
        reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));
        return paymentRepository.findByReservationId(reservationId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return mapToResponse(payment);
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setReservationId(payment.getReservation().getId());
        response.setReservationNumber(payment.getReservation().getReservationNumber());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setTransactionId(payment.getTransactionId());
        response.setStatus(payment.getStatus());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }

    // Inner DTOs
    @lombok.Data
    public static class PaymentRequest {
        @jakarta.validation.constraints.NotNull(message = "Reservation ID is required")
        private Long reservationId;

        @jakarta.validation.constraints.NotNull(message = "Amount is required")
        @jakarta.validation.constraints.DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        private BigDecimal amount;

        @jakarta.validation.constraints.NotNull(message = "Payment method is required")
        private Payment.PaymentMethod paymentMethod;
    }

    @lombok.Data
    public static class PaymentResponse {
        private Long id;
        private Long reservationId;
        private String reservationNumber;
        private BigDecimal amount;
        private Payment.PaymentMethod paymentMethod;
        private String transactionId;
        private Payment.PaymentStatus status;
        private java.time.LocalDateTime createdAt;
    }
}
