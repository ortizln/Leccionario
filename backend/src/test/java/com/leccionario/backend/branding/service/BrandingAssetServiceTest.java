package com.leccionario.backend.branding.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class BrandingAssetServiceTest {

    @TempDir
    Path tempDir;

    private BrandingAssetService service;

    @BeforeEach
    void setUp() throws Exception {
        BrandingStorageProperties properties = new BrandingStorageProperties(tempDir.toString());
        service = new BrandingAssetService(properties);
        service.init();
    }

    @Test
    void storeImage_savesFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file", "logo.png", "image/png", "test-content".getBytes());
        String stored = service.storeImage(file);
        assertNotNull(stored);
        assertTrue(Files.exists(tempDir.resolve(stored)));
    }

    @Test
    void load_existingFile_returnsResource() throws IOException {
        Path file = tempDir.resolve("test.png");
        Files.write(file, "data".getBytes());
        var resource = service.load("test.png");
        assertNotNull(resource);
        assertTrue(resource.exists());
    }
}
