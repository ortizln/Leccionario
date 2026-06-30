package com.leccionario.backend.common.excel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

public final class ExcelSupport {

    private static final DataFormatter DATA_FORMATTER = new DataFormatter();

    private ExcelSupport() {
    }

    public static Workbook newWorkbook() {
        return new XSSFWorkbook();
    }

    public static Workbook openWorkbook(MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();
            return new XSSFWorkbook(inputStream);
        } catch (IOException exception) {
            throw new IllegalArgumentException("No se pudo leer el archivo Excel proporcionado.");
        }
    }

    public static byte[] toBytes(Workbook workbook) {
        try (workbook; ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar el archivo Excel.");
        }
    }

    public static void writeHeaders(Sheet sheet, String... headers) {
        Row row = sheet.createRow(0);
        for (int index = 0; index < headers.length; index++) {
            row.createCell(index).setCellValue(headers[index]);
        }
    }

    public static String getString(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            return "";
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            double numericValue = cell.getNumericCellValue();
            long longValue = (long) numericValue;
            return numericValue == longValue ? String.valueOf(longValue) : String.valueOf(numericValue);
        }
        return DATA_FORMATTER.formatCellValue(cell).trim();
    }

    public static boolean getBoolean(Row row, int index, boolean defaultValue) {
        String value = getString(row, index);
        if (value.isBlank()) {
            return defaultValue;
        }
        return value.equalsIgnoreCase("true")
                || value.equalsIgnoreCase("si")
                || value.equalsIgnoreCase("sí")
                || value.equalsIgnoreCase("activo")
                || value.equals("1");
    }

    public static int getInt(Row row, int index, int defaultValue) {
        String value = getString(row, index);
        return value.isBlank() ? defaultValue : Integer.parseInt(value);
    }

    public static short getShort(Row row, int index, short defaultValue) {
        String value = getString(row, index);
        return value.isBlank() ? defaultValue : Short.parseShort(value);
    }

    public static LocalTime getTime(Row row, int index) {
        String value = getString(row, index);
        return LocalTime.parse(value);
    }

    public static LocalDate getDate(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC && org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        String value = getString(row, index);
        if (value.isBlank()) {
            return null;
        }
        return LocalDate.parse(value);
    }

    public static boolean rowIsEmpty(Row row, int columns) {
        for (int index = 0; index < columns; index++) {
            if (!getString(row, index).isBlank()) {
                return false;
            }
        }
        return true;
    }

    public static void autoSize(Sheet sheet, int columns) {
        for (int index = 0; index < columns; index++) {
            sheet.autoSizeColumn(index);
        }
    }
}
