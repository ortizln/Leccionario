package com.leccionario.backend.library;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LibraryServiceTest {

    private BookCategoryRepository categoryRepository;
    private BookRepository bookRepository;
    private BookLoanRepository loanRepository;
    private BookReservationRepository reservationRepository;
    private LibraryService service;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(BookCategoryRepository.class);
        bookRepository = mock(BookRepository.class);
        loanRepository = mock(BookLoanRepository.class);
        reservationRepository = mock(BookReservationRepository.class);
        service = new LibraryService(categoryRepository, bookRepository, loanRepository, reservationRepository);
    }

    @Test
    void findAllCategories_delegatesToRepository() {
        when(categoryRepository.findByInstitutionIdOrderByNameAsc(1L)).thenReturn(List.of());
        var result = service.findAllCategories(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void createCategory_savesCategory() {
        BookCategory cat = new BookCategory();
        cat.setName("Ciencia");
        when(categoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        BookCategory result = service.createCategory(cat);
        assertEquals("Ciencia", result.getName());
    }

    @Test
    void findAllBooks_delegatesToRepository() {
        when(bookRepository.findByInstitutionIdOrderByTitleAsc(1L)).thenReturn(List.of());
        var result = service.findAllBooks(1L);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void createBook_savesBook() {
        Book book = new Book();
        book.setTitle("Matematicas I");
        when(bookRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        Book result = service.createBook(book);
        assertEquals("Matematicas I", result.getTitle());
    }

    @Test
    void updateBook_modifiesFields() {
        Book existing = new Book();
        existing.setId(1L);
        existing.setTitle("Old Title");
        Book updated = new Book();
        updated.setTitle("New Title");
        updated.setAuthor("Author");
        updated.setIsbn("123");
        when(bookRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(bookRepository.save(any())).thenReturn(existing);
        Book result = service.updateBook(1L, updated);
        assertEquals("New Title", existing.getTitle());
    }

    @Test
    void getActiveLoans_delegatesToRepository() {
        when(loanRepository.findByStatusOrderByDueDateAsc("ACTIVO")).thenReturn(List.of());
        var result = service.getActiveLoans();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getOverdueLoans_delegatesToRepository() {
        when(loanRepository.findByStatusOrderByDueDateAsc("VENCIDO")).thenReturn(List.of());
        var result = service.getOverdueLoans();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getPendingReservations_delegatesToRepository() {
        when(reservationRepository.findByStatus("PENDIENTE")).thenReturn(List.of());
        var result = service.getPendingReservations();
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void searchBooks_delegatesToRepository() {
        when(bookRepository.findByInstitutionIdAndTitleContainingIgnoreCaseOrderByTitleAsc(1L, "math")).thenReturn(List.of());
        var result = service.searchBooks(1L, "math");
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
