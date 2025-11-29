package com.example.demoapi.repository;

import com.example.demoapi.model.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ResidentRepository extends JpaRepository<Resident, Integer> {
    // Spring Data JPA tự hiểu: "Tìm một UserAccount bằng cột username"
    Optional<Resident> findByResidentid(Integer residentid);

    Optional<Resident> findFirstByPhonenumber(String phonenumber);

    Optional<Resident> findByApartment_HouseidAndIsHostTrue(Integer houseId);

    Long countByApartment_Houseid(Integer houseId);
}