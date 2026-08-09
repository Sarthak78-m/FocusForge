package com.aistudycoach.auth.dto;

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
@Schema(description = "Email address request")
public class EmailRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    @Schema(example = "user@example.com")
    private String email;
}
