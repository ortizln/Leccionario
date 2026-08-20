package com.leccionario.backend.institution.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class ElectronicSignatureService {

    private static final Logger log = LoggerFactory.getLogger(ElectronicSignatureService.class);

    private final ConcurrentHashMap<String, KeyPair> keyPairs = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Map<String, String>> signatures = new ConcurrentHashMap<>();

    public KeyPair generateKeyPair(String userId) {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048, new SecureRandom());
            KeyPair kp = gen.generateKeyPair();
            keyPairs.put(userId, kp);
            log.info("E-SIGNATURE: RSA-2048 keypair generated for user {}", userId);
            return kp;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("RSA not available", e);
        }
    }

    public String getPublicKeyBase64(String userId) {
        KeyPair kp = keyPairs.get(userId);
        if (kp == null) {
            kp = generateKeyPair(userId);
        }
        return Base64.getEncoder().encodeToString(kp.getPublic().getEncoded());
    }

    public Map<String, String> generateSignature(String documentType, Long documentId, Long userId) {
        log.info("E-SIGNATURE: Generating signature for {} #{}, user: {}", documentType, documentId, userId);
        String userIdStr = String.valueOf(userId);
        KeyPair kp = keyPairs.get(userIdStr);
        if (kp == null) {
            kp = generateKeyPair(userIdStr);
        }

        String signatureId = UUID.randomUUID().toString();
        String payload = documentType + "|" + documentId + "|" + userId + "|" + System.currentTimeMillis();
        String signatureValue = signPayload(payload, kp.getPrivate());

        Map<String, String> result = new HashMap<>();
        result.put("signatureId", signatureId);
        result.put("documentType", documentType);
        result.put("documentId", String.valueOf(documentId));
        result.put("userId", String.valueOf(userId));
        result.put("algorithm", "SHA256withRSA");
        result.put("payload", payload);
        result.put("signatureValue", signatureValue);
        result.put("publicKey", getPublicKeyBase64(userIdStr));
        result.put("timestamp", java.time.Instant.now().toString());
        result.put("status", "FIRMADO");

        signatures.put(signatureId, result);
        log.info("E-SIGNATURE: Signature {} created successfully", signatureId);
        return result;
    }

    public boolean verifySignature(String signatureId, String payload) {
        Map<String, String> sig = signatures.get(signatureId);
        if (sig == null) {
            log.warn("E-SIGNATURE: Signature {} not found", signatureId);
            return false;
        }

        try {
            String storedPayload = sig.get("payload");
            String storedSigValue = sig.get("signatureValue");
            String storedPubKey = sig.get("publicKey");

            if (!storedPayload.equals(payload)) {
                log.warn("E-SIGNATURE: Payload mismatch for signature {}", signatureId);
                return false;
            }

            PublicKey publicKey = reconstructPublicKey(storedPubKey);
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(payload.getBytes(StandardCharsets.UTF_8));
            boolean valid = signature.verify(Base64.getDecoder().decode(storedSigValue));

            log.info("E-SIGNATURE: Verification for signature {}: {}", signatureId, valid ? "VALID" : "INVALID");
            return valid;
        } catch (Exception e) {
            log.error("E-SIGNATURE: Verification failed for {}: {}", signatureId, e.getMessage());
            return false;
        }
    }

    public Map<String, String> getSignatureInfo(String signatureId) {
        return signatures.get(signatureId);
    }

    private String signPayload(String payload, PrivateKey privateKey) {
        try {
            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initSign(privateKey);
            sig.update(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(sig.sign());
        } catch (Exception e) {
            throw new RuntimeException("Signing failed", e);
        }
    }

    private PublicKey reconstructPublicKey(String base64Key) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(base64Key);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }
}
