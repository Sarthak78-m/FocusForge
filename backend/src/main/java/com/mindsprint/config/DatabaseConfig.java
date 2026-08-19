package com.mindsprint.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:}")
    private String springUrl;

    @Value("${SPRING_DATASOURCE_URL:}")
    private String envSpringUrl;

    @Value("${JDBC_DATABASE_URL:}")
    private String jdbcDatabaseUrl;

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${POSTGRES_URL:}")
    private String postgresUrl;

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
        String rawUrl = selectRawUrl();
        ResolvedDbDetails details = parseDbDetails(rawUrl);

        log.info("[MindSprint DatabaseConfig] Resolved JDBC URL: {}", details.jdbcUrl);
        log.info("[MindSprint DatabaseConfig] Resolved Username: {}", details.username);

        HikariConfig config = new HikariConfig();
        if (details.jdbcUrl.contains("h2")) {
            config.setDriverClassName("org.h2.Driver");
        } else {
            config.setDriverClassName("org.postgresql.Driver");
        }
        config.setJdbcUrl(details.jdbcUrl);
        config.setUsername(details.username);
        config.setPassword(details.password);

        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setIdleTimeout(30000);
        config.setConnectionTimeout(15000);
        config.setMaxLifetime(600000);
        config.setInitializationFailTimeout(10000);

        try {
            return new HikariDataSource(config);
        } catch (Exception e) {
            log.error("[MindSprint DatabaseConfig] PostgreSQL connection failed: {}. Falling back to H2 in-memory DB.", e.getMessage());
            HikariConfig h2Config = new HikariConfig();
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setJdbcUrl("jdbc:h2:mem:mindsprint_db;DB_CLOSE_DELAY=-1;MODE=PostgreSQL");
            h2Config.setUsername("sa");
            h2Config.setPassword("");
            return new HikariDataSource(h2Config);
        }
    }

    private String selectRawUrl() {
        // Priority 1: Explicit env vars with actual production values
        if (StringUtils.hasText(jdbcDatabaseUrl)) return jdbcDatabaseUrl;
        if (StringUtils.hasText(envSpringUrl)) return envSpringUrl;
        if (StringUtils.hasText(databaseUrl)) return databaseUrl;
        if (StringUtils.hasText(postgresUrl)) return postgresUrl;

        // Priority 2: Railway PGHOST / PGDATABASE
        if (StringUtils.hasText(pgHost) && StringUtils.hasText(pgDatabase)) {
            return "jdbc:postgresql://" + pgHost + ":" + pgPort + "/" + pgDatabase;
        }

        // Priority 3: Property spring.datasource.url if not default localhost
        if (StringUtils.hasText(springUrl) && !springUrl.contains("localhost")) {
            return springUrl;
        }

        // Priority 4: Property spring.datasource.url even if localhost
        if (StringUtils.hasText(springUrl)) {
            return springUrl;
        }

        return "jdbc:postgresql://localhost:5432/MindSprintDB";
    }

    private ResolvedDbDetails parseDbDetails(String rawUrl) {
        String url = rawUrl.trim();
        String user = resolveUsername();
        String pass = resolvePassword();

        // Handle postgres:// or postgresql:// or jdbc:postgresql:// with embedded credentials
        if (url.startsWith("postgres://") || url.startsWith("postgresql://") || url.startsWith("jdbc:postgresql://")) {
            try {
                String cleanUri = url.replace("jdbc:", "");
                URI uri = new URI(cleanUri);
                if (uri.getUserInfo() != null && uri.getUserInfo().contains(":")) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    user = userInfo[0];
                    pass = userInfo[1];
                }
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                if (host != null) {
                    url = "jdbc:postgresql://" + host + ":" + port + path;
                }
            } catch (Exception ignored) {}
        }

        if (!url.startsWith("jdbc:")) {
            url = "jdbc:postgresql://" + url;
        }

        return new ResolvedDbDetails(url, user, pass);
    }

    private String resolveUsername() {
        if (StringUtils.hasText(springUsername) && !springUsername.contains("${")) return springUsername;
        if (StringUtils.hasText(pgUser) && !pgUser.contains("${")) return pgUser;
        return StringUtils.hasText(postgresUser) ? postgresUser : "postgres";
    }

    private String resolvePassword() {
        if (StringUtils.hasText(springPassword) && !springPassword.contains("${")) return springPassword;
        if (StringUtils.hasText(pgPassword) && !pgPassword.contains("${")) return pgPassword;
        return postgresPassword != null ? postgresPassword : "";
    }

    private static class ResolvedDbDetails {
        final String jdbcUrl;
        final String username;
        final String password;

        ResolvedDbDetails(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }
    }
}
