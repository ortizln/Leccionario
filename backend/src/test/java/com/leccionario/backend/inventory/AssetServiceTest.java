package com.leccionario.backend.inventory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssetServiceTest {

    private AssetCategoryRepository categoryRepository;
    private AssetRepository assetRepository;
    private AssetAssignmentRepository assignmentRepository;
    private AssetMaintenanceRepository maintenanceRepository;
    private AssetService service;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(AssetCategoryRepository.class);
        assetRepository = mock(AssetRepository.class);
        assignmentRepository = mock(AssetAssignmentRepository.class);
        maintenanceRepository = mock(AssetMaintenanceRepository.class);
        service = new AssetService(categoryRepository, assetRepository, assignmentRepository, maintenanceRepository);
    }

    @Test
    void findAllCategories_delegatesToRepository() {
        when(categoryRepository.findByInstitutionIdOrderByNameAsc(1L)).thenReturn(List.of());
        assertTrue(service.findAllCategories(1L).isEmpty());
    }

    @Test
    void createCategory_savesAndReturns() {
        AssetCategory cat = new AssetCategory();
        cat.setName("Laptops");
        when(categoryRepository.save(cat)).thenReturn(cat);
        AssetCategory result = service.createCategory(cat);
        assertEquals("Laptops", result.getName());
    }

    @Test
    void deleteCategory_delegatesToRepository() {
        service.deleteCategory(1L);
        verify(categoryRepository).deleteById(1L);
    }

    @Test
    void findAll_delegatesToRepository() {
        when(assetRepository.findByInstitutionIdOrderByCodeAsc(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void create_savesAndReturns() {
        Asset asset = new Asset();
        asset.setCode("AST-001");
        when(assetRepository.save(asset)).thenReturn(asset);
        assertNotNull(service.create(asset));
    }

    @Test
    void assign_savesAssignment() {
        Asset asset = new Asset();
        asset.setId(1L);
        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));
        when(assignmentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AssetAssignment result = service.assign(1L, "Juan Perez", 10L);
        assertNotNull(result);
        verify(assetRepository).save(asset);
    }

    @Test
    void assign_assetNotFound_throws() {
        when(assetRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.assign(1L, "Juan", 10L));
    }
}
