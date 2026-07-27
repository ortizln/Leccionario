package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VacancyServiceTest {

    @Mock
    private VacancyRepository repo;

    @InjectMocks
    private VacancyService service;

    @Test
    void findAll_returnsVacancies() {
        Vacancy v = Vacancy.builder().title("Profesor Matematicas").department("Academico").status("OPEN").institutionId(1L).build();
        v.setId(1L);
        when(repo.findByInstitutionIdOrderByPublishedDateDesc(1L)).thenReturn(List.of(v));

        var result = service.findAll(1L);

        assertEquals(1, result.size());
        assertEquals("Profesor Matematicas", result.get(0).getTitle());
    }

    @Test
    void findOpen_returnsOnlyOpenVacancies() {
        Vacancy v = Vacancy.builder().title("Profesor").status("OPEN").institutionId(1L).build();
        v.setId(1L);
        when(repo.findByInstitutionIdAndStatusOrderByPublishedDateDesc(1L, "OPEN")).thenReturn(List.of(v));

        var result = service.findOpen(1L);

        assertEquals(1, result.size());
        assertEquals("OPEN", result.get(0).getStatus());
    }

    @Test
    void save_delegatesToRepository() {
        Vacancy v = Vacancy.builder().title("Nuevo").institutionId(1L).build();
        when(repo.save(any())).thenReturn(v);

        var result = service.save(v);

        assertNotNull(result);
        verify(repo, times(1)).save(v);
    }
}
