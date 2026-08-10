package com.aistudycoach.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url:}")
    private String springUrl;

    @Value("${SPRING_DATASOURCE_URL:}")
    private String envSpringUrl;

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${SPRING_DATASOURCE_USERNAME:}")
    private String springUsername;

    @Value("${PGUSER:}")
    private String pgUser;

    @Value("${POSTGRES_USER:postgres}")
    private String postgresUser;

    @Value("${SPRING_DATASOURCE_PASSWORD:}")
    private String springPassword;

    @Value("${PGPASSWORD:}")
    private String pgPassword;

    @Value("${POSTGRES_PASSWORD:}")
    private String postgresPassword;

    @Value("${PGHOST:}")
    private String pgHost;

    @Value("${PGPORT:5432}")
    private String pgPort;

    @Value("${PGDATABASE:}")
    private String pgDatabase;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        String jdbcUrl = resolveJdbcUrl();
        String username = resolveUsername();
        String password = resolvePassword();

        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }

    private String resolveJdbcUrl() {
        if (StringUtils.hasText(springUrl) && springUrl.startsWith("jdbc:")) {
            return springUrl;
        }
        if (StringUtils.hasText(envSpringUrl) && envSpringUrl.startsWith("jdbc:")) {
            return envSpringUrl;
        }
        if (StringUtils.hasText(databaseUrl)) {
            String url = databaseUrl.trim();
            if (url.startsWith("jdbc:")) {
                return url;
            }
            if (url.startsWith("postgres://")) {
                return "jdbc:postgresql://" + url.substring("postgres://".length());
            }
            if (url.startsWith("postgresql://")) {
                return "jdbc:postgresql://" + url.substring("postgresql://".length());
            }
        }
        if (StringUtils.hasText(pgHost) && StringUtils.hasText(pgDatabase)) {
            return "jdbc:postgresql://" + pgHost + ":" + pgPort + "/" + pgDatabase;
        }
        return "jdbc:postgresql://localhost:5432/AIStudyCoachDB";
    }

    private String resolveUsername() {
        if (StringUtils.hasText(springUsername) && !springUsername.contains("${")) {
            return springUsername;
        }
        if (StringUtils.hasText(pgUser) && !pgUser.contains("${")) {
            return pgUser;
        }
        return StringUtils.hasText(postgresUser) ? postgresUser : "postgres";
    }

    private String resolvePassword() {
        if (StringUtils.hasText(springPassword) && !springPassword.contains("${")) {
            return springPassword;
        }
        if (StringUtils.hasText(pgPassword) && !pgPassword.contains("${")) {
            return pgPassword;
        }
        return postgresPassword != null ? postgresPassword : "";
    }
}
