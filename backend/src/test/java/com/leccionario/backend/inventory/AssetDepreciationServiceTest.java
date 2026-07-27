package com.leccionario.backend.inventory;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AssetDepreciationServiceTest {

    @Mock
    private AssetRepository assetRepo;

    @Mock
    private AssetWarrantyRepository warrantyRepo;

    @InjectMocks
    private AssetDepreciationService depreciationService;

    @Test
    void calculateDepreciation_5yearAsset_returnsCorrectValue() {
        Asset asset = new Asset();
        asset.setPurchaseCost(new BigDecimal("10000.00"));
        asset.setPurchaseDate(LocalDate.now().minusYears(2));

        BigDecimal depreciation = depreciationService.calculateDepreciation(asset, 5);

        assertNotNull(depreciation);
        assertTrue(depreciation.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(depreciation.compareTo(new BigDecimal("10000.00")) < 0);
    }

    @Test
    void calculateCurrentValue_after2Years_returnsExpected() {
        Asset asset = new Asset();
        asset.setPurchaseCost(new BigDecimal("10000.00"));
        asset.setPurchaseDate(LocalDate.now().minusYears(2));

        BigDecimal currentValue = depreciationService.calculateCurrentValue(asset, 5);

        assertNotNull(currentValue);
        assertTrue(currentValue.compareTo(BigDecimal.ZERO) > 0);
        assertTrue(currentValue.compareTo(new BigDecimal("10000.00")) < 0);
    }

    @Test
    void calculateDepreciation_fullyDepreciated_returnsFullCost() {
        Asset asset = new Asset();
        asset.setPurchaseCost(new BigDecimal("10000.00"));
        asset.setPurchaseDate(LocalDate.now().minusYears(10));

        BigDecimal depreciation = depreciationService.calculateDepreciation(asset, 5);

        assertEquals(0, depreciation.compareTo(new BigDecimal("10000.00")));
    }

    @Test
    void calculateDepreciation_nullCost_returnsZero() {
        Asset asset = new Asset();
        asset.setPurchaseCost(null);
        asset.setPurchaseDate(LocalDate.now());

        BigDecimal depreciation = depreciationService.calculateDepreciation(asset, 5);

        assertEquals(0, depreciation.compareTo(BigDecimal.ZERO));
    }

    @Test
    void calculateCurrentValue_longPastFullyDepreciated() {
        Asset asset = new Asset();
        asset.setPurchaseCost(new BigDecimal("5000.00"));
        asset.setPurchaseDate(LocalDate.now().minusYears(20));

        BigDecimal currentValue = depreciationService.calculateCurrentValue(asset, 5);

        assertEquals(0, currentValue.compareTo(BigDecimal.ZERO));
    }
}
