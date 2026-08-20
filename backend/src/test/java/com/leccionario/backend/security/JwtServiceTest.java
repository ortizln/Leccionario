package com.leccionario.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import java.lang.reflect.Field;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField("secret", "test-secret-key-for-unit-tests-32chars!!");
        setField("accessExpiration", 1800000L);
        setField("refreshExpiration", 604800000L);
        userDetails = new User("testuser", "password", Collections.emptyList());
    }

    private void setField(String name, Object value) throws Exception {
        Field field = JwtService.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(jwtService, value);
    }

    @Test
    void generateAccessToken_returnsNonEmptyToken() {
        String token = jwtService.generateAccessToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void generateRefreshToken_returnsNonEmptyToken() {
        String token = jwtService.generateRefreshToken(userDetails);
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void extractUsername_fromAccessToken_returnsCorrectUsername() {
        String token = jwtService.generateAccessToken(userDetails);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void extractUsername_fromRefreshToken_returnsCorrectUsername() {
        String token = jwtService.generateRefreshToken(userDetails);
        String username = jwtService.extractUsername(token);
        assertEquals("testuser", username);
    }

    @Test
    void isTokenValid_withValidAccessToken_returnsTrue() {
        String token = jwtService.generateAccessToken(userDetails);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_withWrongUser_returnsFalse() {
        String token = jwtService.generateAccessToken(userDetails);
        UserDetails wrongUser = new User("wronguser", "password", Collections.emptyList());
        assertFalse(jwtService.isTokenValid(token, wrongUser));
    }

    @Test
    void isRefreshToken_withRefreshToken_returnsTrue() {
        String token = jwtService.generateRefreshToken(userDetails);
        assertTrue(jwtService.isRefreshToken(token));
    }

    @Test
    void isRefreshToken_withAccessToken_returnsFalse() {
        String token = jwtService.generateAccessToken(userDetails);
        assertFalse(jwtService.isRefreshToken(token));
    }

    @Test
    void isTokenExpired_withFreshToken_returnsFalse() {
        String token = jwtService.generateAccessToken(userDetails);
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void isTokenExpired_withExpiredToken_returnsTrue() throws Exception {
        setField("accessExpiration", -1000L);
        String token = jwtService.generateAccessToken(userDetails);
        assertTrue(jwtService.isTokenExpired(token));
    }

    @Test
    void generateAccessToken_twoCallsProduceDifferentTokens() {
        String token1 = jwtService.generateAccessToken(userDetails);
        String token2 = jwtService.generateAccessToken(userDetails);
        assertNotEquals(token1, token2);
    }

    @Test
    void generateRefreshToken_twoCallsProduceDifferentTokens() {
        String token1 = jwtService.generateRefreshToken(userDetails);
        String token2 = jwtService.generateRefreshToken(userDetails);
        assertNotEquals(token1, token2);
    }

    @Test
    void extractUsername_withInvalidToken_throwsException() {
        assertThrows(Exception.class, () -> jwtService.extractUsername("invalid.token.here"));
    }
}
