package com.example.demoapi.controller;

import com.example.demoapi.dto.response.HouseholdResponse;
import com.example.demoapi.model.UserAccount;
import com.example.demoapi.repository.UserAccountRepository;
import com.example.demoapi.service.HouseholdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/households") // Endpoint gốc
@RequiredArgsConstructor
public class HouseholdController {

    private final HouseholdService householdService;
    private final UserAccountRepository userAccountRepository;

    // Endpoint: GET /api/households?search=...
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<HouseholdResponse>> getHouseholds(
            @RequestParam(required = false) String search
    ) {
        List<HouseholdResponse> result = householdService.getHouseholds(search);
        return ResponseEntity.ok(result);
    }

    // Endpoint: GET /api/households/{id}
    @GetMapping("/{id}")
    public ResponseEntity<HouseholdResponse> getHouseholdDetail(@PathVariable Integer id) {

        // 1. Lấy thông tin người đang đăng nhập từ Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName(); // Email user đang đăng nhập

        // 2. Kiểm tra quyền hạn
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin) {
            // A. Nếu là ADMIN: Cho phép xem mọi ID
            return ResponseEntity.ok(householdService.getHouseholdById(id));
        } else {
            // B. Nếu là RESIDENT: Phải kiểm tra xem ID này có phải nhà của họ không
            UserAccount currentUser = userAccountRepository.findByEmail(currentEmail)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

            // Lấy houseId của user hiện tại
            Integer myHouseId = null;
            if (currentUser.getResident() != null && currentUser.getResident().getApartment() != null) {
                myHouseId = currentUser.getResident().getApartment().getHouseid();
            }

            // So sánh ID yêu cầu (id) vs ID nhà mình (myHouseId)
            if (myHouseId != null && myHouseId.equals(id)) {
                return ResponseEntity.ok(householdService.getHouseholdById(id));
            } else {
                // Nếu không khớp -> Chặn (403 Forbidden)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem thông tin hộ khác!");
            }
        }
    }
}