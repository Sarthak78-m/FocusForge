package com.mindsprint.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Login payload")
public class AuthenticationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(example = "user@gmail.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Schema(example = "Password123")
    private String password;
}
