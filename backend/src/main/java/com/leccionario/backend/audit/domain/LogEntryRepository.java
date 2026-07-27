package com.leccionario.backend.audit.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {

    @Query("SELECT a FROM LogEntry a WHERE " +
           "(:username = '' OR LOWER(a.username) LIKE CONCAT('%', LOWER(:username), '%')) AND " +
           "(:module = '' OR LOWER(a.module) LIKE CONCAT('%', LOWER(:module), '%')) " +
           "ORDER BY a.createdAt DESC")
    Page<LogEntry> findFiltered(@Param("username") String username,
                                 @Param("module") String module,
                                 Pageable pageable);

    @Query("SELECT a.module, COUNT(a) FROM LogEntry a GROUP BY a.module ORDER BY COUNT(a) DESC")
    List<Object[]> countByModule();

    @Query("SELECT a.action, COUNT(a) FROM LogEntry a GROUP BY a.action ORDER BY COUNT(a) DESC")
    List<Object[]> countByAction();

    @Query("SELECT a.username, COUNT(a) FROM LogEntry a GROUP BY a.username ORDER BY COUNT(a) DESC")
    List<Object[]> countByUser();
}
