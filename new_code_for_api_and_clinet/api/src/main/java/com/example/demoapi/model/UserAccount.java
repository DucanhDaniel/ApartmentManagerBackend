package com.example.demoapi.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "useraccount")
public class UserAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer accountid;

    // Email dùng để đăng nhập
    @Column(nullable = false, unique = true)
    private String email;

    private String password;
    private String role;

    @OneToOne
    @JoinColumn(name = "residentid", referencedColumnName = "residentid")
    private Resident resident;

    // --- THÊM ĐOẠN NÀY ---

    // Hàm này tự chạy trước khi Hibernate thực hiện câu lệnh INSERT hoặc UPDATE vào Database
    @PrePersist
    @PreUpdate
    private void syncEmailFromResident() {
        // Logic: Chỉ đồng bộ nếu tài khoản này có liên kết với Resident
        if (this.resident != null) {
            // Kiểm tra xem Resident có email không
            if (this.resident.getEmail() != null && !this.resident.getEmail().isEmpty()) {
                // Ép buộc email đăng nhập phải giống email cư dân
                this.email = this.resident.getEmail();
            }
        }
        // Lưu ý: Nếu resident == null (trường hợp Admin), giữ nguyên email do người dùng nhập.
    }
}