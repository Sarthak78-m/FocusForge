package com.aistudycoach.auth.service;

import java.util.Locale;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class EmailAddressValidationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^(?=.{1,254}$)(?=.{1,64}@)(?!.*\\.\\.)"
                    + "[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*"
                    + "@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?"
                    + "(?:\\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$",
            Pattern.CASE_INSENSITIVE
    );

    private final DisposableEmailDomainService disposableEmailDomainService;

    public EmailAddressValidationService(DisposableEmailDomainService disposableEmailDomainService) {
        this.disposableEmailDomainService = disposableEmailDomainService;
    }

    public String normalize(String email) {
        if (email == null) {
            return "";
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public String normalizeAndValidateForRegistration(String email) {
        String normalizedEmail = normalize(email);
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            throw new IllegalArgumentException("Email address is invalid");
        }

        String domain = normalizedEmail.substring(normalizedEmail.lastIndexOf('@') + 1);
        if (disposableEmailDomainService.isDisposableDomain(domain)) {
            throw new IllegalArgumentException("Disposable email addresses are not allowed");
        }

        return normalizedEmail;
    }
}
