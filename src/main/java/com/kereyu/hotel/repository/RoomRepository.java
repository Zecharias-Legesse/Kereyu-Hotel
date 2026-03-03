package com.kereyu.hotel.repository;

import com.kereyu.hotel.model.Room;
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
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByStatus(Room.RoomStatus status);
    Page<Room> findByRoomType(Room.RoomType roomType, Pageable pageable);
    
    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' AND r.id NOT IN " +
           "(SELECT res.room.id FROM Reservation res WHERE " +
           "res.status IN ('CONFIRMED', 'CHECKED_IN') AND " +
           "((res.checkInDate <= :checkOut AND res.checkOutDate >= :checkIn)))")
    List<Room> findAvailableRooms(@Param("checkIn") LocalDate checkIn, 
                                   @Param("checkOut") LocalDate checkOut);
}
