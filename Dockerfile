# ---------- Stage 1: Build ----------
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy POM first (dependency cache)
COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline -q

# Copy source and build
COPY backend/src src
RUN mvn package -DskipTests -q

# ---------- Stage 2: Runtime ----------
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy built JAR
COPY --from=builder /app/target/*.jar app.jar

# Copy Flyway migration for reference
COPY backend/src/main/resources/db/migration/ /app/db/migration/

# Run on port 1080
EXPOSE 1080

ENTRYPOINT ["java", \
  "-Xms256m", "-Xmx512m", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
