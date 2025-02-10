package api

import io.ktor.application.*
import io.ktor.response.*
import io.ktor.request.*
import io.ktor.routing.*
import io.ktor.http.*
import database.Database
import models.User
import java.sql.PreparedStatement

fun Route.userRoutes() {
    route("/users") {
        post("/register") {
            val user = call.receive<User>()
            val conn = Database.getConnection()
            val stmt: PreparedStatement = conn.prepareStatement("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
            stmt.setString(1, user.username)
            stmt.setString(2, user.email)
            stmt.setString(3, user.passwordHash)
            stmt.executeUpdate()
            call.respond(HttpStatusCode.Created, "User Registered Successfully!")
        }

        get("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
            if (id == null) {
                call.respond(HttpStatusCode.BadRequest, "Invalid user ID")
                return@get
            }

            val conn = Database.getConnection()
            val stmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?")
            stmt.setInt(1, id)
            val rs = stmt.executeQuery()

            if (rs.next()) {
                val user = User(rs.getInt("id"), rs.getString("username"), rs.getString("email"), rs.getString("password_hash"))
                call.respond(HttpStatusCode.OK, user)
            } else {
                call.respond(HttpStatusCode.NotFound, "User Not Found")
            }
        }
    }
}