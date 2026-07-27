package com.leccionario.backend.inventory;

import com.leccionario.backend.inventory.Asset;
import com.leccionario.backend.inventory.AssetCustodian;
import com.leccionario.backend.inventory.AssetCustodianRepository;
import com.leccionario.backend.inventory.AssetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssetCustodianServiceTest {

    private AssetCustodianRepository repository;
    private AssetRepository assetRepository;
    private AssetCustodianService service;

    @BeforeEach
    void setUp() {
        repository = mock(AssetCustodianRepository.class);
        assetRepository = mock(AssetRepository.class);
        service = new AssetCustodianService(repository, assetRepository);
    }

    @Test
    void findAll_delegates() {
        when(repository.findByInstitutionIdOrderByAssignedDateDesc(1L)).thenReturn(List.of());
        assertTrue(service.findAll(1L).isEmpty());
    }

    @Test
    void findByEmployee_delegates() {
        when(repository.findByEmployeeIdAndStatusOrderByAssignedDateDesc(1L, "ASIGNADO")).thenReturn(List.of());
        assertTrue(service.findByEmployee(1L).isEmpty());
    }

    @Test
    void assign_saves() {
        Asset asset = new Asset();
        asset.setId(1L);
        AssetCustodian custodian = new AssetCustodian();
        custodian.setAsset(asset);
        when(assetRepository.findById(1L)).thenReturn(Optional.of(asset));
        when(repository.save(any())).thenAnswer(inv -> {
            AssetCustodian c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });
        var result = service.assign(custodian);
        assertNotNull(result);
        verify(repository).save(any());
    }

    @Test
    void assign_assetNotFound_throws() {
        Asset asset = new Asset();
        asset.setId(1L);
        AssetCustodian custodian = new AssetCustodian();
        custodian.setAsset(asset);
        when(assetRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.assign(custodian));
    }

    @Test
    void returnAsset_found() {
        AssetCustodian c = new AssetCustodian();
        c.setId(1L);
        c.setStatus("ASIGNADO");
        when(repository.findById(1L)).thenReturn(Optional.of(c));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        var result = service.returnAsset(1L);
        assertEquals("DEVUELTO", result.getStatus());
    }

    @Test
    void returnAsset_notFound_throws() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> service.returnAsset(1L));
    }

    @Test
    void delete_delegates() {
        service.delete(1L);
        verify(repository).deleteById(1L);
    }
}
