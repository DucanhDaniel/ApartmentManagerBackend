package com.example.demoapi.repository;

import com.example.demoapi.model.Resident;
import com.example.demoapi.model.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.Set;

public interface UserAccountRepository extends JpaRepository<UserAccount, Integer> {
    // Spring Data JPA tự hiểu: "Tìm một UserAccount bằng cột username"
    Optional<UserAccount> findByEmail(String email);

    // Kiểm tra tồn tại
    Boolean existsByEmail(String email);

    Boolean existsByResident(Resident resident);

    void deleteByResident_Residentid(Integer residentId);

    void deleteByResident(Resident resident);

    // Lấy Set các residentId đã có tài khoản (để check cho nhanh)
    @Query("SELECT u.resident.residentid FROM UserAccount u WHERE u.resident IS NOT NULL")
    Set<Integer> findAllResidentIdsWithAccount();
}