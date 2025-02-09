import database.Database

fun main() {
    val connection = Database.getConnection()
    println("✅ Connected to MySQL successfully!")
    connection.close()
}