package com.leccionario.backend.institution.service;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ElectronicSignatureServiceTest {

    private final ElectronicSignatureService signatureService = new ElectronicSignatureService();

    @Test
    void generateSignature_returnsAllFields() {
        Map<String, String> result = signatureService.generateSignature("INVOICE", 1L, 10L);

        assertNotNull(result);
        assertNotNull(result.get("signatureId"));
        assertEquals("INVOICE", result.get("documentType"));
        assertEquals("1", result.get("documentId"));
        assertEquals("10", result.get("userId"));
        assertEquals("SHA256withRSA", result.get("algorithm"));
        assertNotNull(result.get("signatureValue"));
        assertNotNull(result.get("publicKey"));
        assertNotNull(result.get("timestamp"));
        assertEquals("FIRMADO", result.get("status"));
    }

    @Test
    void generateAndVerify_validSignature() {
        Map<String, String> sig = signatureService.generateSignature("INVOICE", 1L, 10L);
        String signatureId = sig.get("signatureId");
        String payload = sig.get("payload");
        assertTrue(signatureService.verifySignature(signatureId, payload));
    }

    @Test
    void verifySignature_tamperedPayload_returnsFalse() {
        Map<String, String> sig = signatureService.generateSignature("INVOICE", 1L, 10L);
        assertFalse(signatureService.verifySignature(sig.get("signatureId"), "TAMPERED|PAYLOAD"));
    }

    @Test
    void verifySignature_unknownSignature_returnsFalse() {
        assertFalse(signatureService.verifySignature("unknown-id", "some-payload"));
    }

    @Test
    void generateKeyPair_returnsValidKeyPair() {
        var kp = signatureService.generateKeyPair("user-1");
        assertNotNull(kp.getPublic());
        assertNotNull(kp.getPrivate());
    }

    @Test
    void getPublicKeyBase64_returnsBase64() {
        String pubKey = signatureService.getPublicKeyBase64("user-2");
        assertNotNull(pubKey);
        assertFalse(pubKey.isEmpty());
    }
}
