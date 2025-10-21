package com.example.demoapi.repository;

import com.example.demoapi.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// Auto generated SQL query base on method name
public interface ApartmentRepository extends JpaRepository<Apartment, Integer> {
    // Spring Data JPA tự hiểu: "Tìm một Apartment bằng cột apartmentid"
    Optional<Apartment> findByhouseid(Integer houseid);
}