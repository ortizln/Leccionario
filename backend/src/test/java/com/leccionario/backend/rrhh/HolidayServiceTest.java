package com.leccionario.backend.rrhh;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HolidayServiceTest {

    @Mock
    private HolidayRepository holidayRepository;

    @InjectMocks
    private HolidayService holidayService;

    @Test
    void isHoliday_returnsTrue_whenActiveHolidayExists() {
        Holiday h = new Holiday();
        h.setActive(true);
        h.setHolidayDate(LocalDate.of(2026, 5, 1));

        when(holidayRepository.findByInstitutionIdAndHolidayDateBetween(1L, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 1)))
            .thenReturn(List.of(h));

        assertTrue(holidayService.isHoliday(1L, LocalDate.of(2026, 5, 1)));
    }

    @Test
    void isHoliday_returnsFalse_whenInactiveHolidayExists() {
        Holiday h = new Holiday();
        h.setActive(false);
        h.setHolidayDate(LocalDate.of(2026, 5, 1));

        when(holidayRepository.findByInstitutionIdAndHolidayDateBetween(1L, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 1)))
            .thenReturn(List.of(h));

        assertFalse(holidayService.isHoliday(1L, LocalDate.of(2026, 5, 1)));
    }

    @Test
    void isHoliday_returnsFalse_whenNoHolidays() {
        when(holidayRepository.findByInstitutionIdAndHolidayDateBetween(1L, LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 1)))
            .thenReturn(List.of());

        assertFalse(holidayService.isHoliday(1L, LocalDate.of(2026, 5, 1)));
    }

    @Test
    void update_throwsWhenNotFound() {
        when(holidayRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> holidayService.update(999L, new Holiday()));
    }

    @Test
    void update_updatesFields() {
        Holiday existing = new Holiday();
        existing.setName("Old");
        existing.setHolidayDate(LocalDate.of(2026, 1, 1));

        Holiday updated = new Holiday();
        updated.setName("New");
        updated.setHolidayDate(LocalDate.of(2026, 6, 1));
        updated.setCategory("LOCAL");
        updated.setDescription("Desc");
        updated.setActive(false);

        when(holidayRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(holidayRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Holiday result = holidayService.update(1L, updated);

        assertEquals("New", result.getName());
        assertEquals(LocalDate.of(2026, 6, 1), result.getHolidayDate());
        assertEquals("LOCAL", result.getCategory());
        assertEquals("Desc", result.getDescription());
        assertFalse(result.getActive());
    }
}
