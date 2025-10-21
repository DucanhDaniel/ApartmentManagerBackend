package com.example.demoapi.controller;

import com.example.demoapi.dto.AuthResponse;
import com.example.demoapi.dto.LoginRequest;
import com.example.demoapi.dto.RefreshTokenResponse;
import com.example.demoapi.security.JwtService;
import com.example.demoapi.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.response-cookie.secure}")
    private boolean secureCookie;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        // 1. Authenticate User (check username, password)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.username(),
                        loginRequest.password()
                )
        );

        // 2. Get UserDetails from the successful authentication
        UserDetails user = (UserDetails) authentication.getPrincipal();

        // 3. Create AccessToken
        String accessToken = jwtService.generateAccessToken(user);

        // 4. Create RefreshToken (and save to DB)
        String refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        // 5. Create HttpOnly Cookie for RefreshToken
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)      // Cannot be accessed by JavaScript
                .secure(secureCookie)
                .path("/api/auth") // Only send to /api/auth endpoints
                .maxAge(7 * 24 * 60 * 60) // 7 days (matches token expiration)
                .build();

        // 6. Return AccessToken in body and RefreshToken in cookie
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new AuthResponse(accessToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        // 1. Get the refresh token string from the cookie
        String oldRefreshTokenString = Arrays.stream(request.getCookies())
                .filter(c -> c.getName().equals("refreshToken"))
                .findFirst()
                .map(Cookie::getValue)
                .orElseThrow(() -> new RuntimeException("Refresh token cookie not found"));

        // 2. "Xoay vòng" token (Service sẽ trả về 1 object chứa cả username va UUID refresh token)
        RefreshTokenService.RotationResult result = refreshTokenService.rotateRefreshToken(oldRefreshTokenString);

        // 3. Get user details to create a new AccessToken
        //    Lấy thông tin trực tiếp từ 'result' (kết quả)
        String newRefreshTokenString = result.newRefreshTokenString();
        String username = result.username();

        UserDetails user = userDetailsService.loadUserByUsername(username);

        // 4. Create new AccessToken
        String newAccessToken = jwtService.generateAccessToken(user);

        // 5. Set the NEW RefreshToken in the HttpOnly cookie
        ResponseCookie newCookie = ResponseCookie.from("refreshToken", newRefreshTokenString)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, newCookie.toString());

        // 6. Return the new AccessToken
        return ResponseEntity.ok(new RefreshTokenResponse(newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // 1. Get the refresh token string from the cookie
        String refreshTokenString = Arrays.stream(request.getCookies())
                .filter(c -> c.getName().equals("refreshToken"))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        // 2. Delete the token from the database
        if (refreshTokenString != null) {
            refreshTokenService.deleteByToken(refreshTokenString);
        }

        // 3. Create an "expired" cookie to clear it from the browser
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "") // Empty value
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/auth")
                .maxAge(0) // Expire immediately
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Logout successful");
    }
}
