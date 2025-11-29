package com.example.demoapi.service;

import com.example.demoapi.dto.request.HouseholdRequest;
import com.example.demoapi.dto.response.HouseholdResponse;
import com.example.demoapi.model.*;
import com.example.demoapi.repository.ApartmentRepository;
import com.example.demoapi.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;

    public List<HouseholdResponse> getHouseholds(String search) {
        return apartmentRepository.findHouseholdsByKeyword(search);
    }

    public HouseholdResponse getHouseholdById(Integer id) {
        return apartmentRepository.findHouseholdDetailById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + id));
    }

    @Transactional
    public HouseholdResponse createHousehold(HouseholdRequest request) {

        // 1. Kiểm tra trùng số phòng (Vẫn phải check cái này)
        if (apartmentRepository.existsByApartmentNumber(request.getRoomNumber())) {
            throw new RuntimeException("Căn hộ " + request.getRoomNumber() + " đã tồn tại!");
        }

        // 2. Tạo và Lưu Căn Hộ
        Apartment apartment = new Apartment();
        apartment.setApartmentNumber(request.getRoomNumber());
        apartment.setArea(request.getArea());

        // Map các trường mới từ DTO
        apartment.setBuilding(request.getBuilding());
        apartment.setFloor(request.getFloor());
        apartment.setStatus(request.getStatus() != null ? request.getStatus() : ApartmentStatus.OCCUPIED);
        apartment.setType(request.getType() != null ? request.getType() : ApartmentType.NORMAL);

        Apartment savedApartment = apartmentRepository.save(apartment);

        // 3. Xử lý Chủ Hộ (Logic: Nếu tồn tại thì tái sử dụng thông tin, nhưng tạo row mới)
        Resident owner = new Resident();

        // Tìm xem ông chủ này (dựa theo SĐT) đã có trong hệ thống chưa (VD: Đang sở hữu nhà khác)
        Optional<Resident> existingOwner = residentRepository.findFirstByPhonenumber(request.getPhoneNumber());

        if (existingOwner.isPresent()) {
            // CASE: Đã tồn tại -> Copy thông tin cá nhân từ hồ sơ cũ sang hồ sơ mới
            Resident oldProfile = existingOwner.get();
            owner.setName(oldProfile.getName()); // Giữ tên cũ cho chuẩn
            owner.setDob(oldProfile.getDob());
            owner.setCccd(oldProfile.getCccd());
            owner.setAddress(oldProfile.getAddress());
            owner.setEmail(oldProfile.getEmail());
            owner.setAvatar(oldProfile.getAvatar());
            // Ghi chú là người này sở hữu nhiều nhà
            owner.setNote("Đồng sở hữu căn hộ: " + oldProfile.getApartment().getApartmentNumber());
        } else {
            // CASE: Chủ hộ mới tinh -> Lấy từ Request
            owner.setName(request.getOwnerName());
            owner.setEmail(request.getEmail());
            // Các trường khác (DOB, CCCD) có thể null hoặc update sau
        }

        // Set các thông tin bắt buộc cho bản ghi mới này
        owner.setPhonenumber(request.getPhoneNumber()); // Key để định danh
        owner.setApartment(savedApartment);
        owner.setIsHost(true);
        owner.setRelationship("Chủ hộ");
        owner.setState(ResidentStatus.THUONG_TRU);
        owner.setStartDate(LocalDate.now());

        residentRepository.save(owner);

        // 4. Trả về Response
        return HouseholdResponse.builder()
                .id(savedApartment.getHouseid())
                .roomNumber(savedApartment.getApartmentNumber())
                .ownerName(owner.getName())
                .area(savedApartment.getArea())
                .memberCount(1L)
                .phoneNumber(owner.getPhonenumber())
                .build();
    }

    @Transactional
    public HouseholdResponse updateHousehold(Integer id, HouseholdRequest request) {
        // 1. Tìm căn hộ cần sửa
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy căn hộ với ID: " + id));

        // 2. Validate Số phòng (Nếu có thay đổi số phòng)
        if (!apartment.getApartmentNumber().equals(request.getRoomNumber())
                && apartmentRepository.existsByApartmentNumber(request.getRoomNumber())) {
            throw new RuntimeException("Số phòng " + request.getRoomNumber() + " đã được sử dụng bởi căn hộ khác!");
        }

        // 3. Cập nhật thông tin Căn hộ
        apartment.setApartmentNumber(request.getRoomNumber());
        apartment.setArea(request.getArea());
        if (request.getBuilding() != null) apartment.setBuilding(request.getBuilding());
        if (request.getFloor() != null) apartment.setFloor(request.getFloor());
        if (request.getStatus() != null) apartment.setStatus(request.getStatus());
        if (request.getType() != null) apartment.setType(request.getType());

        Apartment savedApartment = apartmentRepository.save(apartment);

        // 4. Cập nhật thông tin Chủ hộ
        // Tìm ông chủ hiện tại của nhà này
        Resident owner = residentRepository.findByApartment_HouseidAndIsHostTrue(id)
                .orElseThrow(() -> new RuntimeException("Dữ liệu lỗi: Căn hộ này chưa có chủ hộ!"));

        // Cập nhật thông tin cá nhân chủ hộ
        owner.setName(request.getOwnerName());
        owner.setPhonenumber(request.getPhoneNumber());
        if (request.getEmail() != null) owner.setEmail(request.getEmail());

        // Lưu lại
        residentRepository.save(owner);

        // (Tùy chọn) Tính lại số lượng thành viên
         Long memberCount = residentRepository.countByApartment_Houseid(id);

        // 5. Trả về kết quả
        return HouseholdResponse.builder()
                .id(savedApartment.getHouseid())
                .roomNumber(savedApartment.getApartmentNumber())
                .ownerName(owner.getName())
                .area(savedApartment.getArea())
                .phoneNumber(owner.getPhonenumber())
                .memberCount(memberCount)
                .build();
    }
}