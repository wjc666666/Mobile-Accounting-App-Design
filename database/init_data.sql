INSERT INTO users (username, email, password_hash) 
VALUES 
('testuser', 'test@example.com', 'hashedpassword');

INSERT INTO income (user_id, amount, category, date) 
VALUES 
(1, 5000.00, 'Salary', '2024-02-10');

INSERT INTO expenses (user_id, amount, category, date) 
VALUES 
(1, 1500.00, 'Rent', '2024-02-10');
