package com.kereyu.hotel.service;

import com.kereyu.hotel.dto.RoomDTO;
import com.kereyu.hotel.exception.ResourceNotFoundException;
import com.kereyu.hotel.model.Room;
import com.kereyu.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoomService {
    
    @Autowired
    private RoomRepository roomRepository;
    
    public RoomDTO.RoomResponse createRoom(RoomDTO.RoomRequest request) {
        Room room = new Room();
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setAmenities(request.getAmenities());
        room.setFloor(request.getFloor());
        room.setImageUrl(request.getImageUrl());
        room.setStatus(Room.RoomStatus.AVAILABLE);
        
        Room savedRoom = roomRepository.save(room);
        return mapToResponse(savedRoom);
    }
    
    public RoomDTO.RoomResponse updateRoom(Long id, RoomDTO.RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(request.getRoomType());
        room.setPricePerNight(request.getPricePerNight());
        room.setCapacity(request.getCapacity());
        room.setDescription(request.getDescription());
        room.setAmenities(request.getAmenities());
        room.setFloor(request.getFloor());
        room.setImageUrl(request.getImageUrl());
        
        Room updatedRoom = roomRepository.save(room);
        return mapToResponse(updatedRoom);
    }
    
    public void updateRoomStatus(Long id, Room.RoomStatus status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        room.setStatus(status);
        roomRepository.save(room);
    }
    
    public RoomDTO.RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        return mapToResponse(room);
    }
    
    public Page<RoomDTO.RoomResponse> getAllRooms(Pageable pageable) {
        return roomRepository.findAll(pageable).map(this::mapToResponse);
    }
    
    public List<RoomDTO.RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        return roomRepository.findAvailableRooms(checkIn, checkOut).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with id: " + id));
        roomRepository.delete(room);
    }
    
    private RoomDTO.RoomResponse mapToResponse(Room room) {
        RoomDTO.RoomResponse response = new RoomDTO.RoomResponse();
        response.setId(room.getId());
        response.setRoomNumber(room.getRoomNumber());
        response.setRoomType(room.getRoomType());
        response.setPricePerNight(room.getPricePerNight());
        response.setCapacity(room.getCapacity());
        response.setDescription(room.getDescription());
        response.setAmenities(room.getAmenities());
        response.setFloor(room.getFloor());
        response.setStatus(room.getStatus());
        response.setImageUrl(room.getImageUrl());
        return response;
    }
}
