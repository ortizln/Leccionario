-- V27: Biblioteca

CREATE TABLE book_categories (
    id              BIGSERIAL PRIMARY KEY,
    institution_id  BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    parent_id       BIGINT REFERENCES book_categories(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE books (
    id                BIGSERIAL PRIMARY KEY,
    institution_id    BIGINT NOT NULL,
    category_id       BIGINT REFERENCES book_categories(id),
    isbn              VARCHAR(20),
    title             VARCHAR(300) NOT NULL,
    author            VARCHAR(200),
    publisher         VARCHAR(200),
    publication_year  INT,
    edition           VARCHAR(50),
    pages             INT,
    language          VARCHAR(30) DEFAULT 'Castellano',
    description       TEXT,
    cover_url         VARCHAR(500),
    total_copies      INT NOT NULL DEFAULT 1,
    available_copies  INT NOT NULL DEFAULT 1,
    location          VARCHAR(100),
    status            VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                      CHECK (status IN ('ACTIVO', 'INACTIVO', 'PERDIDO')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_loans (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL REFERENCES books(id),
    student_id      BIGINT,
    user_id         BIGINT,
    loan_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE NOT NULL,
    return_date     DATE,
    status          VARCHAR(15) NOT NULL DEFAULT 'ACTIVO'
                    CHECK (status IN ('ACTIVO', 'DEVUELTO', 'VENCIDO', 'PERDIDO')),
    notes           TEXT,
    created_by      VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE book_reservations (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL REFERENCES books(id),
    student_id      BIGINT,
    user_id         BIGINT,
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date     DATE NOT NULL,
    status          VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (status IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA', 'VENCIDA')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_institution ON books(institution_id);
CREATE INDEX idx_books_category ON books(category_id);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_book_loans_book ON book_loans(book_id);
CREATE INDEX idx_book_loans_student ON book_loans(student_id);
CREATE INDEX idx_book_loans_status ON book_loans(status);
CREATE INDEX idx_book_reservations_book ON book_reservations(book_id);
