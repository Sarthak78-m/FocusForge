package com.mindsprint.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Registration payload for a new Mind Sprint user")
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Schema(example = "Sarthak Sharma")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(example = "user@gmail.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Schema(example = "Password123")
    private String password;

    @NotBlank(message = "Password confirmation is required")
    @Schema(example = "Password123")
    private String confirmPassword;
}
