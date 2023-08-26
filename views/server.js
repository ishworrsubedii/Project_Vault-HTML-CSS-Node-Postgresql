const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

// Configure Express
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));

// Database configuration
const connectionString = 'postgresql://projectvault:haha@localhost:5432/postgres';

// Serve the registration form page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/form/form.html");
});

// Handle form submission and insert data into the database
app.post("/", async (req, res) => {
    const { f_name, mail, phone } = req.body;
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        await client.query('INSERT INTO Form (f_name, mail, phone) VALUES ($1, $2, $3)', [f_name, mail, phone]);
        console.log("Data inserted successfully");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            client.end(); // Close the client after the operation
        }
    }

    res.redirect("/");
});

// Handle delete requests
app.post("/delete/:id", async (req, res) => {
    const idToDelete = req.params.id;
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        await client.query('DELETE FROM Form WHERE id = $1', [idToDelete]);
        console.log("Data deleted successfully");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            client.end(); // Close the client after the operation
        }
    }

    res.redirect("/data"); // Redirect back to the data display page after deletion
});

// Handle edit requests
app.get("/connects/:id", async (req, res) => {
    const idToEdit = req.params.id;

    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('SELECT * FROM Form WHERE id = $1', [idToEdit]);
        const row = queryResult.rows[0]; // Assuming the query returns one row
        res.render(__dirname + "/form/edit.ejs", { rowData: row });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred while fetching data from the database.");
    } finally {
        if (client) {
            client.end(); // Close the client after the operation
        }
    }
});

app.post("/connects/:id", async (req, res) => {
    const idToEdit = req.params.id;
    const { editName, editMail, editPhone } = req.body;
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        await client.query('UPDATE Form SET f_name = $1, mail = $2, phone = $3 WHERE id = $4', [editName, editMail, editPhone, idToEdit]);
        console.log("Data updated successfully");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            client.end(); // Close the client after the operation
        }
    }

    res.redirect("/data"); // Redirect back to the data display page after editing
});

// Retrieve data from the database and render it in a view
app.get("/data", async (req, res) => {
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('SELECT * FROM Form');
        const rows = queryResult.rows;
        res.render(__dirname + "/form/data.ejs", { data: rows });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred while fetching data from the database.");
    } finally {
        if (client) {
            client.end(); // Close the client after the operation
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
