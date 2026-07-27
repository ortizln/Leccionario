package com.leccionario.backend.library;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LibraryFineServiceTest {

    private LibraryFineRepository fineRepository;
    private BookLoanRepository loanRepository;
    private BookRepository bookRepository;
    private LibraryFineService service;

    @BeforeEach
    void setUp() {
        fineRepository = mock(LibraryFineRepository.class);
        loanRepository = mock(BookLoanRepository.class);
        bookRepository = mock(BookRepository.class);
        service = new LibraryFineService(fineRepository, loanRepository, bookRepository);
    }

    private BookLoan makeLoan(LocalDate dueDate, LocalDate returnDate) {
        BookLoan loan = new BookLoan();
        loan.setBookId(10L);
        loan.setStudentId(20L);
        loan.setDueDate(dueDate);
        loan.setReturnDate(returnDate);
        return loan;
    }

    @Test
    void calculateFine_overdueLoan_createsFine() {
        BookLoan loan = makeLoan(LocalDate.now().minusDays(5), null);
        Book book = new Book();
        book.setInstitutionId(1L);

        when(loanRepository.findById(1L)).thenReturn(Optional.of(loan));
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(fineRepository.save(any(LibraryFine.class))).thenAnswer(inv -> inv.getArgument(0));

        LibraryFine result = service.calculateFine(1L);
        assertNotNull(result);
        assertEquals(5, result.getDaysOverdue());
        assertEquals(new BigDecimal("2.50"), result.getFineAmount());
        assertEquals("PENDIENTE", result.getStatus());
    }

    @Test
    void calculateFine_notOverdue_returnsNull() {
        when(loanRepository.findById(1L)).thenReturn(Optional.of(makeLoan(LocalDate.now().plusDays(3), null)));
        assertNull(service.calculateFine(1L));
    }

    @Test
    void calculateFine_alreadyReturned_returnsNull() {
        when(loanRepository.findById(1L)).thenReturn(Optional.of(makeLoan(LocalDate.now().minusDays(5), LocalDate.now())));
        assertNull(service.calculateFine(1L));
    }

    @Test
    void pay_setsStatusPaid() {
        LibraryFine fine = LibraryFine.builder().status("PENDIENTE").build();
        when(fineRepository.findById(1L)).thenReturn(Optional.of(fine));
        when(fineRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        LibraryFine result = service.pay(1L);
        assertEquals("PAGADA", result.getStatus());
        assertNotNull(result.getPaidDate());
    }

    @Test
    void forgive_setsStatusCondoned() {
        LibraryFine fine = LibraryFine.builder().status("PENDIENTE").build();
        when(fineRepository.findById(1L)).thenReturn(Optional.of(fine));
        when(fineRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        LibraryFine result = service.forgive(1L);
        assertEquals("CONDONADA", result.getStatus());
    }

    @Test
    void delete_delegatesToRepository() {
        service.delete(1L);
        verify(fineRepository).deleteById(1L);
    }

    @Test
    void dailyFine_isFiftyCents() {
        assertEquals(new BigDecimal("0.50"), LibraryFineService.DAILY_FINE);
    }
}
