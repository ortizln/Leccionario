package com.leccionario.backend.sri;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class SriServiceTest {

    private final SriService service = new SriService();

    @Test
    void validateTaxDocument_returnsAuthorized() {
        Map<String, String> result = service.validateTaxDocument("1790000000001", "1234567890");
        assertEquals("AUTORIZADO", result.get("status"));
        assertEquals("1790000000001", result.get("rucEmisor"));
    }

    @Test
    void getDocumentStatus_returnsStatus() {
        Map<String, Object> result = service.getDocumentStatus("abc123");
        assertEquals("AUTORIZADO", result.get("estado"));
        assertEquals("abc123", result.get("claveAcceso"));
    }

    @Test
    void sendDocument_returnsReceived() {
        Map<String, String> result = service.sendDocument("<factura>xml</factura>", "FACTURA");
        assertEquals("RECIBIDO", result.get("status"));
        assertEquals("FACTURA", result.get("tipoComprobante"));
    }

    @Test
    void getCertificateStatus_returnsValid() {
        Map<String, Object> result = service.getCertificateStatus("1790000000001");
        assertEquals("VALIDO", result.get("certificado"));
        assertEquals("ACTIVO", result.get("estado"));
    }
}
