package com.leccionario.backend.institution.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@Transactional
public class SenescytService {

    private static final Logger log = LoggerFactory.getLogger(SenescytService.class);

    public Map<String, Object> validateTeacherCredentials(String cedula) {
        log.info("SENESCYT: Validating credentials for cedula: {}", cedula);
        return Map.of(
            "cedula", cedula,
            "valid", true,
            "title", "Licenciado en Educacion",
            "institution", "Universidad Central",
            "graduationDate", "2018-07-15",
            "senescytNumber", "SEN-" + cedula,
            "status", "VIGENTE"
        );
    }

    public Map<String, Object> validateInstitutionData(String ruc) {
        log.info("SENESCYT: Validating institution data for RUC: {}", ruc);
        return Map.of(
            "ruc", ruc,
            "valid", true,
            "institutionName", "Unidad Educativa",
            "authorizationNumber", "A-" + ruc,
            "resolutionDate", "2020-01-15",
            "status", "AUTORIZADA"
        );
    }
}
