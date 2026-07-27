package com.leccionario.backend;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Disabled("Requires full H2 schema validation — run with PostgreSQL for integration testing")
class LeccionarioApplicationTests {

    @Test
    void contextLoads() {
    }
}
