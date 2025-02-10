package database

import java.sql.Connection
import java.sql.DriverManager

object Database {
    private const val JDBC_URL = "jdbc:mysql://localhost:3306/mobile_accounting_db"
    private const val USER = "root"  
    private const val PASSWORD = "A18762786919xp!"  

    fun getConnection(): Connection {
        Class.forName("com.mysql.cj.jdbc.Driver")  
        return DriverManager.getConnection(JDBC_URL, USER, PASSWORD)
    }
}