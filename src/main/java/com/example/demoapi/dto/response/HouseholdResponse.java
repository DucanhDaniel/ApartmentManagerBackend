package com.example.demoapi.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor // Quan trọng: Lombok tự tạo constructor đầy đủ tham số
@NoArgsConstructor
public class HouseholdResponse {
    private Integer id;
    private String roomNumber;
    private String ownerName;
    private Double area;

    // --- SỬA Ở ĐÂY ---
    private Long memberCount; // Đổi từ Integer -> Long vì hàm COUNT trả về Long
    // -----------------

    private String phoneNumber;
}