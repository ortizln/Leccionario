package com.leccionario.backend.institution.service;

import com.leccionario.backend.institution.domain.InstitutionSetting;
import com.leccionario.backend.institution.repository.InstitutionSettingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InstitutionSettingServiceTest {

    private InstitutionSettingRepository repository;
    private InstitutionSettingService service;

    @BeforeEach
    void setUp() {
        repository = mock(InstitutionSettingRepository.class);
        service = new InstitutionSettingService(repository);
    }

    @Test
    void create_savesAndReturns() {
        InstitutionSetting s = new InstitutionSetting();
        s.setSettingKey("theme");
        when(repository.save(s)).thenReturn(s);
        assertEquals("theme", service.create(s).getSettingKey());
    }

    @Test
    void save_delegatesToRepository() {
        InstitutionSetting s = new InstitutionSetting();
        when(repository.save(s)).thenReturn(s);
        assertNotNull(service.save(s));
    }

    @Test
    void update_found() {
        InstitutionSetting existing = new InstitutionSetting();
        existing.setId(1L);
        existing.setSettingValue("old");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InstitutionSetting updates = new InstitutionSetting();
        updates.setSettingKey("theme");
        updates.setSettingValue("new");
        updates.setCategory("APPEARANCE");
        InstitutionSetting result = service.update(1L, updates);
        assertEquals("new", result.getSettingValue());
    }

    @Test
    void update_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.update(1L, new InstitutionSetting()));
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void findByKey_found() {
        InstitutionSetting s = new InstitutionSetting();
        s.setSettingKey("theme");
        when(repository.findByInstitutionIdAndSettingKey(1L, "theme")).thenReturn(Optional.of(s));
        assertEquals("theme", service.findByKey(1L, "theme").getSettingKey());
    }

    @Test
    void findByKey_notFound_throws() {
        when(repository.findByInstitutionIdAndSettingKey(1L, "missing")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.findByKey(1L, "missing"));
    }

    @Test
    void findByInstitution_delegatesToRepository() {
        when(repository.findByInstitutionIdOrderByCategoryAndSettingKey(1L)).thenReturn(List.of());
        assertTrue(service.findByInstitution(1L).isEmpty());
    }

    @Test
    void findByCategory_delegatesToRepository() {
        when(repository.findByInstitutionIdAndCategoryOrderBySettingKey(1L, "APPEARANCE")).thenReturn(List.of());
        assertTrue(service.findByCategory(1L, "APPEARANCE").isEmpty());
    }

    @Test
    void getSettingsMap_buildsKeyMap() {
        InstitutionSetting s1 = new InstitutionSetting();
        s1.setSettingKey("theme");
        s1.setSettingValue("dark");
        InstitutionSetting s2 = new InstitutionSetting();
        s2.setSettingKey("lang");
        s2.setSettingValue("es");
        when(repository.findByInstitutionIdOrderByCategoryAndSettingKey(1L)).thenReturn(List.of(s1, s2));

        var map = service.getSettingsMap(1L);
        assertEquals("dark", map.get("theme"));
        assertEquals("es", map.get("lang"));
    }
}
