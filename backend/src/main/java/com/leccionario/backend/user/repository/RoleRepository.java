package com.leccionario.backend.user.repository;

import com.leccionario.backend.user.domain.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(String name);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM role_permissions", nativeQuery = true)
    void deleteAllPermissions();
}
