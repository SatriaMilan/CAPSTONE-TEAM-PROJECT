const mysql = require('mysql');

const connection = mysql.createConnection({
    host: '',
    user: 'root',
    database: 'junkcash',
    password: ''
});

const addingOrder = async (request, h) => {
    try {
        const payload = request.payload || {};
        const { username, email, wasteType, quantity, collectorLoc, userLoc, notes } = payload;

        // Check if quantity is empty
        if (!quantity) {
            const response = h.response({
                status: 'fail',
                message: 'Failed to insert a new order. Please fill in the quantity',
            });
            response.code(400);
            return response;
        }

        let price;
        switch (wasteType) {
            case 'kertas':
                price = 500 * quantity;
                break;
            case 'logam':
                price = 1000 * quantity;
                break;
            default:
                price = 0;
                break;
        }

        var imgUrl = '';
        const currentDate = new Date().toISOString();
        const date = currentDate.slice(0, 19).replace('T', ' ');
        const status = 'In Process';

        const query = "INSERT INTO orders (username, email, wasteType, quantity, price, collectorLoc, userLoc, notes, attachment, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [username, email, wasteType, quantity, price, collectorLoc, userLoc, notes, imgUrl, date, status], (err, rows, fields) => {
                if (err) {
                    console.error("Database error:", err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        return h.response({ message: "Insert Successful" });
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to insert into the database" }).code(500);
    }
};

const gettingAllOrders = async (request, h) => {
    try {
        const query = "SELECT * FROM orders";
        const result = await new Promise((resolve, reject) => {
            connection.query(query, (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        return h.response(result);
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to retrieve orders" }).code(500);
    }
};

const gettingOrderByEmail = async (request, h) => {
    const email  = request.params.email;
    try {
        const query = "SELECT * FROM orders WHERE email = ?"
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [email], (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // No orders found for the provided email
        if (result.length === 0) {
            return h.response({ message: "No orders found for the specified email" }).code(404);
        }

        return h.response(result);
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to retrieve orders" }).code(500);
    }
}

const gettingOrderById = async (request, h) => {
    const id  = request.params.id;
    try {
        const query = "SELECT * FROM orders WHERE id = ?"
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [id], (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // No orders found for the provided id
        if (result.length === 0) {
            return h.response({ message: "No orders found" }).code(404);
        }

        return h.response(result);
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to retrieve orders" }).code(500);
    }
}

const gettingTotalPrice = async (request, h) => {
    const username = request.params.username;

    try {
        const query = "SELECT SUM(price) AS total_price FROM orders WHERE username = ?";
        
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [username], (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        if (result.length === 0) {
            return h.response({ message: "No orders found for the specified username" }).code(404);
        }

        return h.response(result[0]);
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to retrieve total price" }).code(500);
    }
};


const canceledStatus = async (request, h) => {
    const id = request.params.id;
    try {
        const query = "UPDATE orders SET status = 'Canceled' WHERE id = ? AND status != 'Completed'";
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [id], (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // No orders found for the provided id
        if (result.length === 0) {
            return h.response({ message: "No orders found" }).code(404);
        }

        return h.response(result);
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to update order status" }).code(500);
    }
}

const completedStatus = async (request, h) => {
    const id = request.params.id;
    try {
        const query = "UPDATE orders SET status = 'Completed' WHERE id = ? && status != 'Canceled'";
        const result = await new Promise((resolve, reject) => {
            connection.query(query, [id], (err, rows, fields) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // No orders found for the provided id
        if (result.length === 0) {
            return h.response({ message: "No orders found" }).code(404);
        }

        return h.response(result);
    } catch (error) {
        console.error("Error:", error);
        return h.response({ message: "Failed to update order status" }).code(500);
    }
}

module.exports = {
    addingOrder,
    gettingAllOrders,
    gettingOrderByEmail,
    gettingOrderById,
    canceledStatus,
    completedStatus,
    gettingTotalPrice
};
