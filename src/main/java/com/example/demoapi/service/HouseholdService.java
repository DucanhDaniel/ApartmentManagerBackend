package com.example.demoapi.service;

import com.example.demoapi.dto.response.HouseholdResponse;
import com.example.demoapi.repository.ApartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HouseholdService {

    private final ApartmentRepository apartmentRepository;

    public List<HouseholdResponse> getHouseholds(String search) {
        return apartmentRepository.findHouseholdsByKeyword(search);
    }

    public HouseholdResponse getHouseholdById(Integer id) {
        return apartmentRepository.findHouseholdDetailById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + id));
    }
}