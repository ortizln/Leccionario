# ---------- Stage 1: Build ----------
FROM eclipse-temurin:17-jdk AS builder

WORKDIR /app

# Copy Maven wrapper and POM first (dependency cache)
COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build
COPY backend/src src
RUN ./mvnw package -DskipTests -q

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy built JAR
COPY --from=builder /app/target/*.jar app.jar

# Copy SQL migrations for reference
COPY backend/src/main/resources/db/migration /app/migrations

# Run on port 1080
EXPOSE 1080

ENTRYPOINT ["java", \
  "-Xms256m", "-Xmx512m", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
