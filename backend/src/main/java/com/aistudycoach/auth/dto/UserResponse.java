package com.aistudycoach.auth.dto;

import com.aistudycoach.user.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
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
@Schema(description = "Authenticated user profile")
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean emailVerified;
    private String maskedPhoneNumber;
    private boolean phoneNotificationsEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
