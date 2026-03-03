package com.kereyu.hotel.dto;

import com.kereyu.hotel.model.Room;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

public class RoomDTO {

    @Data
    public static class RoomRequest {
        @NotBlank(message = "Room number is required")
        private String roomNumber;

        @NotNull(message = "Room type is required")
        private Room.RoomType roomType;

        @NotNull(message = "Price per night is required")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0")
        private BigDecimal pricePerNight;

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1")
        private Integer capacity;

        @Size(max = 1000, message = "Description must be under 1000 characters")
        private String description;

        private String amenities;

        @NotNull(message = "Floor is required")
        @Min(value = 1, message = "Floor must be at least 1")
        private Integer floor;

        private String imageUrl;
    }
    
    @Data
    public static class RoomResponse {
        private Long id;
        private String roomNumber;
        private Room.RoomType roomType;
        private BigDecimal pricePerNight;
        private Integer capacity;
        private String description;
        private String amenities;
        private Integer floor;
        private Room.RoomStatus status;
        private String imageUrl;
    }
    
    @Data
    public static class RoomStatusUpdate {
        @NotNull(message = "Status is required")
        private Room.RoomStatus status;
    }
}
