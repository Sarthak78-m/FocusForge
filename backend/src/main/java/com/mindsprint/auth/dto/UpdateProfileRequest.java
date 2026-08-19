package com.mindsprint.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Request object for updating a user's profile")
public class UpdateProfileRequest {

    @NotBlank(message = "Name cannot be blank")
    @Schema(description = "The new name of the user", example = "John Doe")
    private String name;
}
