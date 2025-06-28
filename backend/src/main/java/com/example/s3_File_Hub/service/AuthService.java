package com.example.s3_File_Hub.service;

import com.example.s3_File_Hub.dto.AuthRequest;
import com.example.s3_File_Hub.dto.AuthResponse;
import com.example.s3_File_Hub.dto.RegisterRequest;
import com.example.s3_File_Hub.entity.Role;
import com.example.s3_File_Hub.entity.User;
import com.example.s3_File_Hub.repository.UserRepository;
import com.example.s3_File_Hub.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already registered with this email.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(false)
                .build();

        userRepository.save(user);

        String verificationLink = "http://localhost:8080/api/auth/verify?email=" + user.getEmail();
        emailService.sendEmail(user.getEmail(), "Email Verification", "Click to verify your account: " + verificationLink);

        log.info("Verification email sent to {}", user.getEmail());
        return new AuthResponse("", "Verification email sent.");
    }

    public AuthResponse login(AuthRequest request) {
        log.info("Login attempt for {}", request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            throw new RuntimeException("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account not verified. Please check your email.");
        }

        String token = jwtUtil.generateToken(user);
        log.info("Login successful for {}", user.getEmail());
        return new AuthResponse(token, "Login successful.");
    }

    public String verifyEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (user.isEnabled()) {
            return "Account is already verified.";
        }

        user.setEnabled(true);
        userRepository.save(user);
        log.info("Email verified for {}", user.getEmail());
        return "Email verified successfully.";
    }
}
