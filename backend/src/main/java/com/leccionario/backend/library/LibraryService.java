package com.leccionario.backend.library;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LibraryService {

    private final BookCategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BookLoanRepository loanRepository;
    private final BookReservationRepository reservationRepository;

    public LibraryService(BookCategoryRepository categoryRepository, BookRepository bookRepository,
                          BookLoanRepository loanRepository, BookReservationRepository reservationRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.loanRepository = loanRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<BookCategory> findAllCategories(Long institutionId) {
        return categoryRepository.findByInstitutionIdOrderByNameAsc(institutionId);
    }

    @Transactional
    public BookCategory createCategory(BookCategory cat) { return categoryRepository.save(cat); }

    @Transactional
    public BookCategory updateCategory(Long id, BookCategory updated) {
        BookCategory cat = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        cat.setName(updated.getName());
        cat.setDescription(updated.getDescription());
        cat.setParentId(updated.getParentId());
        return categoryRepository.save(cat);
    }

    @Transactional
    public void deleteCategory(Long id) { categoryRepository.deleteById(id); }

    public List<Book> findAllBooks(Long institutionId) {
        return bookRepository.findByInstitutionIdOrderByTitleAsc(institutionId);
    }

    @Transactional
    public Book createBook(Book book) { return bookRepository.save(book); }

    @Transactional
    public Book updateBook(Long id, Book updated) {
        Book book = bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
        book.setTitle(updated.getTitle());
        book.setAuthor(updated.getAuthor());
        book.setPublisher(updated.getPublisher());
        book.setIsbn(updated.getIsbn());
        book.setCategoryId(updated.getCategoryId());
        book.setPublicationYear(updated.getPublicationYear());
        book.setEdition(updated.getEdition());
        book.setPages(updated.getPages());
        book.setLanguage(updated.getLanguage());
        book.setDescription(updated.getDescription());
        book.setTotalCopies(updated.getTotalCopies());
        book.setAvailableCopies(updated.getAvailableCopies());
        book.setLocation(updated.getLocation());
        return bookRepository.save(book);
    }

    @Transactional
    public BookLoan createLoan(BookLoan loan) {
        Book book = bookRepository.findById(loan.getBookId()).orElseThrow(() -> new RuntimeException("Book not found"));
        if (book.getAvailableCopies() <= 0) throw new RuntimeException("No copies available");
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);
        return loanRepository.save(loan);
    }

    @Transactional
    public BookLoan returnBook(Long loanId) {
        BookLoan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus("DEVUELTO");
        loan.setReturnDate(LocalDate.now());
        Book book = bookRepository.findById(loan.getBookId()).orElseThrow();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);
        return loanRepository.save(loan);
    }

    public List<BookLoan> getActiveLoans() { return loanRepository.findByStatusOrderByDueDateAsc("ACTIVO"); }
    public List<BookLoan> getLoansByBook(Long bookId) { return loanRepository.findByBookIdOrderByCreatedAtDesc(bookId); }

    @Transactional
    public BookReservation createReservation(BookReservation res) { return reservationRepository.save(res); }

    @Transactional
    public BookReservation completeReservation(Long id) {
        BookReservation res = reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Reservation not found"));
        res.setStatus("COMPLETADA");
        return reservationRepository.save(res);
    }

    public List<BookReservation> getPendingReservations() { return reservationRepository.findByStatus("PENDIENTE"); }

    public List<BookReservation> getAllReservations() {
        return reservationRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    public List<BookReservation> getReservationsByBook(Long bookId) {
        return reservationRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @Transactional
    public BookReservation cancelReservation(Long id) {
        BookReservation res = reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Reservation not found"));
        res.setStatus("CANCELADA");
        return reservationRepository.save(res);
    }

    public java.util.Map<String, Object> getLibraryStats(Long institutionId) {
        List<Book> books = bookRepository.findByInstitutionIdOrderByTitleAsc(institutionId);
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalBooks", books.size());
        stats.put("totalCopies", books.stream().mapToInt(Book::getTotalCopies).sum());
        stats.put("availableCopies", books.stream().mapToInt(Book::getAvailableCopies).sum());
        stats.put("activeLoans", loanRepository.findByStatusOrderByDueDateAsc("ACTIVO").size());
        stats.put("overdueLoans", loanRepository.findByStatusOrderByDueDateAsc("VENCIDO").size());
        stats.put("pendingReservations", reservationRepository.findByStatus("PENDIENTE").size());
        return stats;
    }

    public List<Book> searchBooks(Long institutionId, String query) {
        return bookRepository.findByInstitutionIdAndTitleContainingIgnoreCaseOrderByTitleAsc(institutionId, query);
    }

    public List<BookLoan> getOverdueLoans() {
        return loanRepository.findByStatusOrderByDueDateAsc("VENCIDO");
    }

    public List<BookLoan> getLoansByStudent(Long studentId) {
        return loanRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    public java.util.Map<String, Object> getBookReports(Long institutionId) {
        java.util.Map<String, Object> reports = new java.util.HashMap<>();
        List<Book> books = bookRepository.findByInstitutionIdOrderByTitleAsc(institutionId);

        long totalBooks = books.size();
        int totalCopies = books.stream().mapToInt(Book::getTotalCopies).sum();
        int availableCopies = books.stream().mapToInt(Book::getAvailableCopies).sum();
        long totalLoans = loanRepository.count();
        long activeLoans = loanRepository.findByStatusOrderByDueDateAsc("ACTIVO").size();
        long overdueLoans = loanRepository.findByStatusOrderByDueDateAsc("VENCIDO").size();
        long totalReservations = reservationRepository.count();

        reports.put("totalBooks", totalBooks);
        reports.put("totalCopies", totalCopies);
        reports.put("availableCopies", availableCopies);
        reports.put("occupancyRate", totalCopies > 0 ? ((double)(totalCopies - availableCopies) / totalCopies * 100) : 0);
        reports.put("totalLoans", totalLoans);
        reports.put("activeLoans", activeLoans);
        reports.put("overdueLoans", overdueLoans);
        reports.put("overdueRate", activeLoans > 0 ? ((double)overdueLoans / activeLoans * 100) : 0);
        reports.put("totalReservations", totalReservations);
        reports.put("mostLoaned", loanRepository.findMostLoanedBooks(institutionId));
        reports.put("booksByCategory", bookRepository.countByCategory(institutionId));
        return reports;
    }

    public byte[] getLoanHistoryPdf(Long studentId) {
        List<BookLoan> loans = loanRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, java.awt.Color.WHITE);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Historial de Prestamos - Estudiante #" + studentId, titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidths(new float[]{15, 30, 20, 20, 15});
            addCell(table, "Libro ID", headerFont);
            addCell(table, "Fecha Prestamo", headerFont);
            addCell(table, "Fecha Devolucion", headerFont);
            addCell(table, "Fecha Limite", headerFont);
            addCell(table, "Estado", headerFont);

            for (BookLoan l : loans) {
                addCell(table, String.valueOf(l.getBookId()), normalFont);
                addCell(table, l.getLoanDate() != null ? l.getLoanDate().format(fmt) : "", normalFont);
                addCell(table, l.getReturnDate() != null ? l.getReturnDate().format(fmt) : "-", normalFont);
                addCell(table, l.getDueDate() != null ? l.getDueDate().format(fmt) : "", normalFont);
                addCell(table, l.getStatus() != null ? l.getStatus() : "", normalFont);
            }
            if (loans.isEmpty()) {
                PdfPCell empty = new PdfPCell(new Paragraph("Sin prestamos registrados", normalFont));
                empty.setColspan(5);
                table.addCell(empty);
            }
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating loan history PDF", e);
        }
        return baos.toByteArray();
    }

    public byte[] getLibraryReportPdf(Long institutionId) {
        java.util.Map<String, Object> reports = getBookReports(institutionId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.LETTER, 40, 40, 40, 40);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            Paragraph title = new Paragraph("Reporte de Biblioteca", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidths(new float[]{60, 40});
            addCellKv(table, "Total Libros", String.valueOf(reports.getOrDefault("totalBooks", 0)), boldFont, normalFont);
            addCellKv(table, "Total Copias", String.valueOf(reports.getOrDefault("totalCopies", 0)), boldFont, normalFont);
            addCellKv(table, "Copias Disponibles", String.valueOf(reports.getOrDefault("availableCopies", 0)), boldFont, normalFont);
            addCellKv(table, "Prestamos Activos", String.valueOf(reports.getOrDefault("activeLoans", 0)), boldFont, normalFont);
            addCellKv(table, "Prestamos Vencidos", String.valueOf(reports.getOrDefault("overdueLoans", 0)), boldFont, normalFont);
            addCellKv(table, "Reservas Pendientes", String.valueOf(reports.getOrDefault("pendingReservations", 0)), boldFont, normalFont);
            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Error generating library report PDF", e);
        }
        return baos.toByteArray();
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setBackgroundColor(new java.awt.Color(60, 68, 54));
        table.addCell(cell);
    }

    private void addCellKv(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, labelFont));
        labelCell.setPadding(6);
        labelCell.setBackgroundColor(new java.awt.Color(244, 241, 222));
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Paragraph(value, valueFont));
        valueCell.setPadding(6);
        table.addCell(valueCell);
    }
}
