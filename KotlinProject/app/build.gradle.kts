plugins {
    kotlin("jvm") version "1.8.10"
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:2.3.6")
    implementation("io.ktor:ktor-server-netty:2.3.6")
    implementation("io.ktor:ktor-server-content-negotiation:2.3.6")
    implementation("io.ktor:ktor-serialization-jackson:2.3.6")
    implementation("io.ktor:ktor-server-status-pages:2.3.6")
    implementation("io.ktor:ktor-server-request-validation:2.3.6")
    implementation("io.ktor:ktor-server-routing:2.3.6")
}


application {
    mainClass.set("main.kotlin.MainKt")
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}
