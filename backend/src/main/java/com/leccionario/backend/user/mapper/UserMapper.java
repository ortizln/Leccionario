package com.leccionario.backend.user.mapper;

import com.leccionario.backend.user.domain.User;
import com.leccionario.backend.user.dto.UserResponse;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getIdentification(),
                user.getFirstName(),
                user.getLastName(),
                user.isEnabled(),
                user.getInstitution().getId(),
                user.getInstitution().getName(),
                null,
                user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()));
    }
}
