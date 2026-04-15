package com.leccionario.backend.demerit.dto;

public record DemeritOptionResponse(
        Long id,
        String code,
        String category,
        String description,
        short score) {
}
