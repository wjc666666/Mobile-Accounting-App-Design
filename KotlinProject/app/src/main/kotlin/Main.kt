package main

import io.ktor.application.*
import io.ktor.features.ContentNegotiation
import io.ktor.http.HttpStatusCode
import io.ktor.jackson.jackson
import io.ktor.response.respond
import io.ktor.routing.routing
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.features.StatusPages
import io.ktor.http.HttpStatusCode.Companion.InternalServerError
import database.Database
import java.sql.SQLException
import models.User
import io.ktor.request.receive
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.server.application.ApplicationCall

fun main() {
    try {
        val connection = Database.getConnection()
        println("✅ Connected to MySQL successfully!")
        connection.close()
    } catch (e: SQLException) {
        println("❌ Error connecting to the database: ${e.message}")
    }

    // Start the Ktor server
    embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            jackson { }
        }

        install(StatusPages) {
            exception<Throwable> { cause ->
                call.respond(HttpStatusCode.InternalServerError, cause.localizedMessage)
            }
        }

        routing {
            userRoutes()  // Assuming you have defined user routes in another file like UserApi.kt
        }
    }.start(wait = true)
}