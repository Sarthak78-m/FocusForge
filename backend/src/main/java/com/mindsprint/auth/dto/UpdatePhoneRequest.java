package com.mindsprint.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Update phone number request with strict E.164 formatting and explicit privacy consent toggle")
public class UpdatePhoneRequest {

    @Pattern(regexp = "^\\+[1-9]\\d{1,14}$", message = "Phone number must be in E.164 international format (e.g. +919876543210 or +12025550123)")
    private String phoneNumber;

    private boolean phoneNotificationsEnabled;
}
