package com.aistudycoach.auth.controller;

import com.aistudycoach.auth.dto.ApiResponse;
import com.aistudycoach.auth.dto.AuthenticationRequest;
import com.aistudycoach.auth.dto.AuthenticationResponse;
import com.aistudycoach.auth.dto.EmailRequest;
import com.aistudycoach.auth.dto.RegistrationResponse;
import com.aistudycoach.auth.dto.RegisterRequest;
import com.aistudycoach.auth.dto.ResetPasswordRequest;
import com.aistudycoach.auth.dto.TokenRequest;
import com.aistudycoach.auth.dto.UserResponse;
import com.aistudycoach.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Authentication", description = "Registration, login, and current user APIs")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        RegistrationResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Account created. Check your email to verify your account.", response));
    }

    @Operation(summary = "Authenticate a user and return a JWT")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody AuthenticationRequest request,
            HttpServletRequest servletRequest
    ) {
        AuthenticationResponse response = authService.login(request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Verify an email address using a single-use token")
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody TokenRequest request) {
        authService.verifyEmail(request.getToken());
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully. You can now log in.", null));
    }

    @Operation(summary = "Resend an email verification link")
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@Valid @RequestBody EmailRequest request) {
        authService.resendVerification(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an unverified account exists for that email, a verification link has been sent.",
                null
        ));
    }

    @Operation(summary = "Request a password reset link")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody EmailRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists for that email, a password reset link has been sent.",
                null
        ));
    }

    @Operation(summary = "Reset a password using a single-use token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You can now log in.", null));
    }

    @Operation(
            summary = "Get current authenticated user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        UserResponse response = authService.getCurrentUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Current user fetched successfully", response));
    }
}
