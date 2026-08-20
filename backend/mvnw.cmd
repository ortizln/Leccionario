@REM
@REM Copyright 2015 the original author or authors.
@REM
@REM Licensed under the Apache License, Version 2.0 (the "License");
@REM you may not use this file except in compliance with the License.
@REM You may obtain a copy of the License at
@REM
@REM      https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing, software
@REM distributed under the License is distributed on an "AS IS" BASIS,
@REM WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
@REM See the License for the specific language governing permissions and
@REM limitations under the License.
@REM

@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Required ENV vars:
@REM JAVA_HOME - location of a JDK home dir
@REM
@REM Optional ENV vars
@REM   MVNW_REPOURL - repository url base for downloading maven distribution
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
@REM   MVNW_VERBOSE - true: enable verbose log; debug: trace the mvnw script;
@REM                  others: silence the output
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN ("%~dp0\.mvn\wrapper\maven-wrapper.properties") DO @(
    IF "%%~A"=="wrapperUrl" SET "WRAPPER_URL=%%~B"
    IF "%%~A"=="distributionUrl" SET "MAVEN_URL=%%~B"
)

@IF "%WRAPPER_URL%"=="" SET "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

@SET MAVEN_HOME_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9
@SET WRAPPER_JAR=%MAVEN_HOME_DIR%\maven-wrapper.jar

@IF NOT EXIST %WRAPPER_JAR% (
    @MKDIR %MAVEN_HOME_DIR%
    @powershell -Command "& {" ^
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
        "$ProgressPreference = 'SilentlyContinue';" ^
        "Invoke-WebRequest -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%' -UseBasicParsing" ^
    "}"
    @IF %ERRORLEVEL% NEQ 0 (
        @SET __MVNW_ERROR__=Failed to download Maven Wrapper jar from %WRAPPER_URL%
        @goto :error
    )
)

@SET WRAPPER_PROPERTIES=%~dp0\.mvn\wrapper\maven-wrapper.properties
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@IF NOT EXIST "%MAVEN_HOME_DIR%\apache-maven-3.9.9\bin\mvn.cmd" (
    @IF "%MAVEN_URL%"=="" SET "MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
    @powershell -Command "& {" ^
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;" ^
        "$ProgressPreference = 'SilentlyContinue';" ^
        "Invoke-WebRequest -Uri '%MAVEN_URL%' -OutFile '%MAVEN_HOME_DIR%\maven.zip' -UseBasicParsing;" ^
        "Expand-Archive -Path '%MAVEN_HOME_DIR%\maven.zip' -DestinationPath '%MAVEN_HOME_DIR%'" ^
    "}"
)

@"%JAVA_HOME%\bin\java.exe" ^
    %MAVEN_OPTS% ^
    -classpath "%WRAPPER_JAR%" ^
    "%WRAPPER_LAUNCHER%" ^
    -Dmaven.multiModuleProjectDirectory="%~dp0" ^
    %*

@IF %ERRORLEVEL% NEQ 0 goto error
@goto end

:error
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@EXIT /B 1

:end
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
