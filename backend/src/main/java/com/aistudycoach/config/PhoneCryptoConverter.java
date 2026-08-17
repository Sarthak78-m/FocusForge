package com.aistudycoach.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@Converter
public class PhoneCryptoConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES";
    private static final byte[] DEFAULT_SECRET = "FocusForgeEncryptKey32BytesLong!".getBytes(StandardCharsets.UTF_8);

    private final Key key;

    public PhoneCryptoConverter(@Value("${app.security.phone-crypto-secret:FocusForgeEncryptKey32BytesLong!}") String secret) {
        byte[] keyBytes = StringUtils.hasText(secret) && secret.length() >= 32
                ? secret.substring(0, 32).getBytes(StandardCharsets.UTF_8)
                : DEFAULT_SECRET;
        this.key = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (!StringUtils.hasText(attribute)) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            return Base64.getEncoder().encodeToString(cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            log.error("Failed to encrypt phone number PII: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (!StringUtils.hasText(dbData)) {
            return null;
        }
        try {
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            return new String(cipher.doFinal(Base64.getDecoder().decode(dbData)), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("Failed to decrypt phone number PII: {}", e.getMessage());
            return null;
        }
    }

    public static String maskPhoneNumber(String phone) {
        if (phone == null || phone.isBlank()) return null;
        int len = phone.length();
        if (len <= 4) return "****";
        String visibleEnd = phone.substring(len - 4);
        String prefix = phone.startsWith("+") ? phone.substring(0, Math.min(3, len - 4)) : "";
        return prefix + " ***** **" + visibleEnd;
    }
}
