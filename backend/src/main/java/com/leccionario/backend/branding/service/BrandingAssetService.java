package com.leccionario.backend.branding.service;

import com.leccionario.backend.common.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class BrandingAssetService {

    private final BrandingStorageProperties properties;
    private Path storageRoot;

    @PostConstruct
    void init() {
        storageRoot = Path.of(properties.path()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo crear la carpeta de archivos institucionales.", exception);
        }
    }

    public String storeImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Selecciona una imagen valida para continuar.");
        }
        String contentType = Objects.toString(file.getContentType(), "");
        if (!contentType.startsWith("image/")) {
            throw new BusinessException("Solo se permiten archivos de imagen.");
        }

        String originalName = StringUtils.cleanPath(Objects.toString(file.getOriginalFilename(), "imagen"));
        String extension = "";
        int extensionIndex = originalName.lastIndexOf('.');
        if (extensionIndex >= 0) {
            extension = originalName.substring(extensionIndex).toLowerCase();
        }

        String storedName = UUID.randomUUID() + extension;
        Path target = storageRoot.resolve(storedName).normalize();
        if (!target.startsWith(storageRoot)) {
            throw new BusinessException("No se pudo almacenar la imagen enviada.");
        }

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BusinessException("No se pudo guardar la imagen en el servidor.");
        }
        return storedName;
    }

    public Resource load(String fileName) {
        Path target = storageRoot.resolve(StringUtils.cleanPath(fileName)).normalize();
        if (!target.startsWith(storageRoot) || !Files.exists(target)) {
            throw new BusinessException("No existe el archivo solicitado.");
        }
        return new FileSystemResource(target);
    }
}
