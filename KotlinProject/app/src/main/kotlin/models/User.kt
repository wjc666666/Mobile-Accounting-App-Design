package models

data class User(
    val id: Int? = null,
    val username: String,
    val email: String,
    val passwordHash: String
)