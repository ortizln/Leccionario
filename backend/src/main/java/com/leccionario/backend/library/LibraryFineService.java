package com.leccionario.backend.library;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class LibraryFineService {
    private final LibraryFineRepository fineRepository;
    private final BookLoanRepository loanRepository;
    private final BookRepository bookRepository;

    public static final BigDecimal DAILY_FINE = new BigDecimal("0.50"); // $0.50 per day

    public LibraryFineService(LibraryFineRepository fineRepository, BookLoanRepository loanRepository, BookRepository bookRepository) {
        this.fineRepository = fineRepository;
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
    }

    public List<LibraryFine> findAll(Long institutionId) {
        return fineRepository.findByInstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    public List<LibraryFine> findPending(Long institutionId) {
        return fineRepository.findByInstitutionIdAndStatusOrderByCreatedAtDesc(institutionId, "PENDIENTE");
    }

    public List<LibraryFine> findByStudent(Long studentId) {
        return fineRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @Transactional
    public LibraryFine calculateFine(Long loanId) {
        BookLoan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Prestamo no encontrado"));
        if (loan.getDueDate() == null || loan.getReturnDate() != null) return null;

        LocalDate now = LocalDate.now();
        if (!now.isAfter(loan.getDueDate())) return null;

        Book book = bookRepository.findById(loan.getBookId())
                .orElseThrow(() -> new RuntimeException("Libro no encontrado"));

        long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), now);
        BigDecimal amount = DAILY_FINE.multiply(BigDecimal.valueOf(daysOverdue));

        LibraryFine fine = LibraryFine.builder()
                .loan(loan)
                .studentId(loan.getStudentId())
                .fineAmount(amount)
                .daysOverdue((int) daysOverdue)
                .status("PENDIENTE")
                .reason("Prestamo vencido por " + daysOverdue + " dias")
                .institutionId(book.getInstitutionId())
                .build();
        return fineRepository.save(fine);
    }

    @Transactional
    public LibraryFine pay(Long id) {
        LibraryFine fine = fineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Multa no encontrada"));
        fine.setStatus("PAGADA");
        fine.setPaidDate(LocalDate.now());
        return fineRepository.save(fine);
    }

    @Transactional
    public LibraryFine forgive(Long id) {
        LibraryFine fine = fineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Multa no encontrada"));
        fine.setStatus("CONDONADA");
        return fineRepository.save(fine);
    }

    @Transactional
    public void delete(Long id) {
        fineRepository.deleteById(id);
    }
}