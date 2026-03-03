package com.kereyu.hotel.repository;

import com.kereyu.hotel.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByReservationNumber(String reservationNumber);
    Page<Reservation> findByUserId(Long userId, Pageable pageable);
    Page<Reservation> findByStatus(Reservation.ReservationStatus status, Pageable pageable);
    List<Reservation> findByRoomIdAndStatus(Long roomId, Reservation.ReservationStatus status);
    
    @Query("SELECT r FROM Reservation r WHERE r.checkInDate = :date AND r.status = 'CONFIRMED'")
    List<Reservation> findCheckInsForDate(@Param("date") LocalDate date);
    
    @Query("SELECT r FROM Reservation r WHERE r.checkOutDate = :date AND r.status = 'CHECKED_IN'")
    List<Reservation> findCheckOutsForDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.room.id = :roomId " +
            "AND r.status NOT IN (com.kereyu.hotel.model.Reservation.ReservationStatus.CANCELLED, " +
            "com.kereyu.hotel.model.Reservation.ReservationStatus.REJECTED) " +
            "AND r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate")
    boolean existsConflictingReservation(@Param("roomId") Long roomId,
                                         @Param("checkInDate") LocalDate checkInDate,
                                         @Param("checkOutDate") LocalDate checkOutDate);
}
