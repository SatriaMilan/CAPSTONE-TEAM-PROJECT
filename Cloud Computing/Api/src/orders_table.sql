CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    wasteType VARCHAR(100) NOT NULL,
    price INT(11) NOT NULL,
    quantity float NOT NULL
    collectorLoc VARCHAR(255) NOT NULL,
    userLoc VARCHAR(255) NOT NULL,
    notes TEXT,
    attachment VARCHAR(255),
    date VARCHAR NOT NULL,
    status VARCHAR(20),
)