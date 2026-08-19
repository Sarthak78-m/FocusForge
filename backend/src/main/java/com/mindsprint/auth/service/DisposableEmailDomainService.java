package com.mindsprint.auth.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class DisposableEmailDomainService {

    private static final String DOMAIN_RESOURCE = "disposable-email-domains.txt";

    private final Set<String> blockedDomains;

    public DisposableEmailDomainService(
            @Value("${auth.email.blocked-domains:}") String configuredBlockedDomains
    ) {
        Set<String> domains = new HashSet<>();
        loadBundledDomains(domains);
        Arrays.stream(configuredBlockedDomains.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(domain -> domain.toLowerCase(Locale.ROOT))
                .forEach(domains::add);
        blockedDomains = Set.copyOf(domains);
    }

    public boolean isDisposableDomain(String domain) {
        String normalizedDomain = domain.toLowerCase(Locale.ROOT);
        return blockedDomains.stream().anyMatch(blockedDomain ->
                normalizedDomain.equals(blockedDomain)
                        || normalizedDomain.endsWith("." + blockedDomain)
        );
    }

    private void loadBundledDomains(Set<String> domains) {
        ClassPathResource resource = new ClassPathResource(DOMAIN_RESOURCE);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                resource.getInputStream(),
                StandardCharsets.UTF_8
        ))) {
            reader.lines()
                    .map(String::trim)
                    .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                    .map(domain -> domain.toLowerCase(Locale.ROOT))
                    .forEach(domains::add);
        } catch (IOException ex) {
            throw new IllegalStateException("Unable to load disposable email domains", ex);
        }
    }
}
