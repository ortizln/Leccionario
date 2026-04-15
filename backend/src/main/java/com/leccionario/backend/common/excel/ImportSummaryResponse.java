package com.leccionario.backend.common.excel;

import java.util.List;

public record ImportSummaryResponse(
        String module,
        int total,
        int imported,
        int failed,
        String message,
        List<String> errors) {
}
