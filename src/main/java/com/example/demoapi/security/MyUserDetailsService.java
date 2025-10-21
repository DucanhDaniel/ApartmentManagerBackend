package com.example.demoapi.security;

import com.example.demoapi.model.UserAccount;
import com.example.demoapi.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {

    private final UserAccountRepository userAccountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount userAccount = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Đây là mấu chốt: Cung cấp vai trò (role) cho Spring Security
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(userAccount.getRole());

        return new User(
                userAccount.getUsername(),
                userAccount.getPassword(),
                Collections.singletonList(authority) // [ROLE_ADMIN] hoặc [ROLE_RESIDENT]
        );
    }
}