FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

COPY pom.xml .
COPY src ./src

RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /workspace/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 1080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
