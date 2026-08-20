package com.leccionario.backend.library;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;
    private final LibraryFineService libraryFineService;

    public LibraryController(LibraryService libraryService, LibraryFineService libraryFineService) {
        this.libraryService = libraryService;
        this.libraryFineService = libraryFineService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<BookCategory>> findAllCategories(@RequestParam Long institutionId) {
        return ResponseEntity.ok(libraryService.findAllCategories(institutionId));
    }

    @PostMapping("/categories")
    public ResponseEntity<BookCategory> createCategory(@RequestBody BookCategory cat) {
        return ResponseEntity.ok(libraryService.createCategory(cat));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<BookCategory> updateCategory(@PathVariable Long id, @RequestBody BookCategory cat) {
        return ResponseEntity.ok(libraryService.updateCategory(id, cat));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        libraryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/books")
    public ResponseEntity<List<Book>> findAllBooks(@RequestParam Long institutionId) {
        return ResponseEntity.ok(libraryService.findAllBooks(institutionId));
    }

    @PostMapping("/books")
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        return ResponseEntity.ok(libraryService.createBook(book));
    }

    @PutMapping("/books/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        return ResponseEntity.ok(libraryService.updateBook(id, book));
    }

    @PostMapping("/loans")
    public ResponseEntity<BookLoan> createLoan(@RequestBody BookLoan loan) {
        return ResponseEntity.ok(libraryService.createLoan(loan));
    }

    @PostMapping("/loans/{id}/return")
    public ResponseEntity<BookLoan> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(libraryService.returnBook(id));
    }

    @GetMapping("/loans/active")
    public ResponseEntity<List<BookLoan>> getActiveLoans() {
        return ResponseEntity.ok(libraryService.getActiveLoans());
    }

    @GetMapping("/books/{id}/loans")
    public ResponseEntity<List<BookLoan>> getLoansByBook(@PathVariable Long id) {
        return ResponseEntity.ok(libraryService.getLoansByBook(id));
    }

    @PostMapping("/reservations")
    public ResponseEntity<BookReservation> createReservation(@RequestBody BookReservation res) {
        return ResponseEntity.ok(libraryService.createReservation(res));
    }

    @PostMapping("/reservations/{id}/complete")
    public ResponseEntity<BookReservation> completeReservation(@PathVariable Long id) {
        return ResponseEntity.ok(libraryService.completeReservation(id));
    }

    @GetMapping("/reservations/pending")
    public ResponseEntity<List<BookReservation>> getPendingReservations() {
        return ResponseEntity.ok(libraryService.getPendingReservations());
    }

    @GetMapping("/reservations")
    public ResponseEntity<List<BookReservation>> getAllReservations() {
        return ResponseEntity.ok(libraryService.getAllReservations());
    }

    @GetMapping("/reservations/book/{bookId}")
    public ResponseEntity<List<BookReservation>> getReservationsByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(libraryService.getReservationsByBook(bookId));
    }

    @PostMapping("/reservations/{id}/cancel")
    public ResponseEntity<BookReservation> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(libraryService.cancelReservation(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<java.util.Map<String, Object>> getStats(@RequestParam Long institutionId) {
        return ResponseEntity.ok(libraryService.getLibraryStats(institutionId));
    }

    @GetMapping("/books/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam Long institutionId, @RequestParam String q) {
        return ResponseEntity.ok(libraryService.searchBooks(institutionId, q));
    }

    @GetMapping("/loans/overdue")
    public ResponseEntity<List<BookLoan>> getOverdueLoans() {
        return ResponseEntity.ok(libraryService.getOverdueLoans());
    }

    @GetMapping("/loans/student/{studentId}")
    public ResponseEntity<List<BookLoan>> getLoansByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(libraryService.getLoansByStudent(studentId));
    }

    @GetMapping("/reports")
    public ResponseEntity<java.util.Map<String, Object>> getBookReports(@RequestParam Long institutionId) {
        return ResponseEntity.ok(libraryService.getBookReports(institutionId));
    }

    @GetMapping("/books/export")
    public ResponseEntity<byte[]> exportCSV(@RequestParam Long institutionId) {
        List<Book> books = libraryService.findAllBooks(institutionId);
        StringBuilder csv = new StringBuilder();
        csv.append("Titulo,Autor,ISBN,Editorial,Ano,Categoria,Total,Disponibles,Ubicacion\n");
        books.forEach(b -> csv.append(String.format("%s,%s,%s,%s,%s,%s,%d,%d,%s%n",
            b.getTitle(), b.getAuthor(), b.getIsbn(), b.getPublisher(),
            b.getPublicationYear(), b.getCategoryId(), b.getTotalCopies(),
            b.getAvailableCopies(), b.getLocation())));
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=biblioteca.csv")
            .header("Content-Type", "text/csv; charset=UTF-8")
            .body(csv.toString().getBytes());
    }

    @GetMapping("/fines")
    public ResponseEntity<List<LibraryFine>> findFines(@RequestParam Long institutionId) {
        return ResponseEntity.ok(libraryFineService.findAll(institutionId));
    }

    @GetMapping("/fines/pending")
    public ResponseEntity<List<LibraryFine>> findPendingFines(@RequestParam Long institutionId) {
        return ResponseEntity.ok(libraryFineService.findPending(institutionId));
    }

    @GetMapping("/fines/student/{studentId}")
    public ResponseEntity<List<LibraryFine>> findFinesByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(libraryFineService.findByStudent(studentId));
    }

    @PostMapping("/fines/calculate/{loanId}")
    public ResponseEntity<LibraryFine> calculateFine(@PathVariable Long loanId) {
        LibraryFine fine = libraryFineService.calculateFine(loanId);
        return fine != null ? ResponseEntity.ok(fine) : ResponseEntity.noContent().build();
    }

    @PostMapping("/fines/{id}/pay")
    public ResponseEntity<LibraryFine> payFine(@PathVariable Long id) {
        return ResponseEntity.ok(libraryFineService.pay(id));
    }

    @PostMapping("/fines/{id}/forgive")
    public ResponseEntity<LibraryFine> forgiveFine(@PathVariable Long id) {
        return ResponseEntity.ok(libraryFineService.forgive(id));
    }

    @GetMapping("/books/{id}/qr")
    public ResponseEntity<byte[]> getBookQr(@PathVariable Long id) {
        try {
            com.lowagie.text.pdf.Barcode128 barcode = new com.lowagie.text.pdf.Barcode128();
            barcode.setCode(String.valueOf(id));
            java.awt.Image awtImage = barcode.createAwtImage(java.awt.Color.BLACK, java.awt.Color.WHITE);

            int width = 300;
            int height = 80;
            java.awt.image.BufferedImage bimg = new java.awt.image.BufferedImage(width, height, java.awt.image.BufferedImage.TYPE_INT_RGB);
            java.awt.Graphics2D g = bimg.createGraphics();
            g.setColor(java.awt.Color.WHITE);
            g.fillRect(0, 0, width, height);
            g.drawImage(awtImage, 10, 5, null);
            g.setColor(java.awt.Color.BLACK);
            g.setFont(new java.awt.Font("Arial", java.awt.Font.PLAIN, 12));
            g.drawString("Libro ID: " + id, 10, 70);
            g.dispose();

            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            javax.imageio.ImageIO.write(bimg, "png", baos);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=barcode_book_" + id + ".png")
                    .contentType(org.springframework.http.MediaType.IMAGE_PNG)
                    .body(baos.toByteArray());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping(value = "/loans/student/{studentId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLoanHistoryPdf(@PathVariable Long studentId) {
        byte[] pdf = libraryService.getLoanHistoryPdf(studentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=historial_prestamos_" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping(value = "/report/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getLibraryReportPdf(@RequestParam Long institutionId) {
        byte[] pdf = libraryService.getLibraryReportPdf(institutionId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=reporte_biblioteca.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}