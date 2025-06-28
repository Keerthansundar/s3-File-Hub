package com.example.s3_File_Hub.controller;



import com.example.s3_File_Hub.dto.AuthRequest;
import com.example.s3_File_Hub.dto.AuthResponse;
import com.example.s3_File_Hub.dto.RegisterRequest;
import com.example.s3_File_Hub.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/verify")
    public ResponseEntity<String> verifyEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.verifyEmail(email));
    }
}
