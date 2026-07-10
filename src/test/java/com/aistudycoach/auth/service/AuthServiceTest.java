package com.aistudycoach.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.aistudycoach.auth.dto.AuthenticationRequest;
import com.aistudycoach.auth.dto.AuthenticationResponse;
import com.aistudycoach.auth.dto.RegisterRequest;
import com.aistudycoach.exception.EmailAlreadyExistsException;
import com.aistudycoach.repository.UserRepository;
import com.aistudycoach.security.JwtService;
import com.aistudycoach.user.Role;
import com.aistudycoach.user.User;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService() {
            @Override
            public String generateToken(UserDetails userDetails) {
                return "jwt-token";
            }
        };
        authService = new AuthService(userRepository, passwordEncoder, jwtService, authenticationManager);
    }

    @Test
    void registerSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Sarthak Sharma")
                .email("USER@gmail.com")
                .password("Password123")
                .build();

        when(userRepository.existsByEmail("user@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        AuthenticationResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertThat(savedUser.getName()).isEqualTo("Sarthak Sharma");
        assertThat(savedUser.getEmail()).isEqualTo("user@gmail.com");
        assertThat(savedUser.getPassword()).isEqualTo("encoded-password");
        assertThat(savedUser.getRole()).isEqualTo(Role.USER);
    }

    @Test
    void registerDuplicateEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Sarthak Sharma")
                .email("user@gmail.com")
                .password("Password123")
                .build();

        when(userRepository.existsByEmail("user@gmail.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessage("Email already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginSuccess() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("USER@gmail.com")
                .password("Password123")
                .build();
        User user = User.builder()
                .id(1L)
                .name("Sarthak Sharma")
                .email("user@gmail.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();

        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(user));

        AuthenticationResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void loginInvalidPassword() {
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("user@gmail.com")
                .password("wrong-password")
                .build();

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Invalid email or password");

        verify(userRepository, never()).findByEmail(any());
    }
}
