package com.example.demoapi.controller;

import com.example.demoapi.dto.response.HouseholdResponse;
import com.example.demoapi.service.HouseholdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households") // Endpoint gốc
@RequiredArgsConstructor
public class HouseholdController {

    private final HouseholdService householdService;

    // Endpoint: GET /api/households?search=...
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HouseholdResponse>> getHouseholds(
            @RequestParam(required = false) String search
    ) {
        List<HouseholdResponse> result = householdService.getHouseholds(search);
        return ResponseEntity.ok(result);
    }
}