const express = require('express')
const mysql = require('mysql')

const app = express()

app.use(express.json())

const port = 3000

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "mydb",
    port: 8889
})

con.connect(function (err) {
    if (err) throw err
    console.log("Connected!")
    const sql = "CREATE TABLE IF NOT EXISTS products (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), category VARCHAR(255), price FLOAT, stock INT)";
    con.query(sql, function (err, result) {
        if (err) throw err
        if (result.warningStatus === 0) {
            console.log("Table created")
        } else {
            console.log("Table already exists")
        }
    })
})

const validateData = (productData) => {
    let errors = []
    if (!productData.name) {
        errors.push('Please enter the product name')
    }
    if (!productData.category) {
        errors.push('Please enter the product category')
    }
    if (!productData.price) {
        errors.push('Please enter the price')
    }
    if (!productData.stock) {
        errors.push('Please enter the quantity of the product')
    }
    return errors
}

// API Endpoint: เพิ่มสินค้า
app.post('/products', (req, res) => {
    try {
        let product = req.body
        const errors = validateData(product)
        if (errors.length > 0) {
            throw {
                errorMessage: 'Incomplete data',
                errors: errors
            }
        } else {
            con.query('INSERT INTO products SET ?', product, (err, results) => {
                if (err) {
                    throw err;
                } else {
                    res.status(201).json({
                        message: 'Created successfully'
                    });
                }
            });
        }
    } catch (err) {
        res.status(500).send(err)
    }
});

// API Endpoint: ดูรายการสินค้า
app.get('/products', (req, res) => {
    try {
        con.query('SELECT * FROM products', (err, results) => {
            if (err) {
                throw err
            } else {
                res.status(200).json(results)
            }
        })
    } catch (err) {
        res.status(500).send(err)
    }
})

// API Endpoint: แก้ไขสินค้า
app.put('/products/:id', (req, res) => {
    try {
        let id = req.params.id
        let updateUser = req.body
        con.query('UPDATE products SET ? WHERE id = ?', [updateUser, id], (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send('Updated successfully')
            }
        })
    } catch (err) {
        res.status(500).send(err)
    }
})

// API Endpoint: ลบสินค้า
app.delete('/products/:id', (req, res) => {
    try {
        let id = req.params.id;
        con.query('DELETE FROM products WHERE id = ?', id, (err, results) => {
            if (err) {
                res.status(500).send(err);
            } else {
                res.status(200).send('Deleted successfully');
            }
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(port, (req, res) => {
    console.log('http server run at ' + port)
})