package com.aistudycoach.repository;

import com.aistudycoach.auth.token.EmailVerificationToken;
import com.aistudycoach.user.User;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

    @Modifying
    @Query("""
            update EmailVerificationToken token
            set token.usedAt = :usedAt
            where token.user = :user and token.usedAt is null
            """)
    int invalidateActiveTokensForUser(@Param("user") User user, @Param("usedAt") LocalDateTime usedAt);
}
