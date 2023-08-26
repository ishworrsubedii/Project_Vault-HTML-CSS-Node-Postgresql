const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 9000;
let dirname = '/home/ishwor/Desktop/Sunway/5thSem/Web technologies/Projects/Project Vault/';

app.set('view engine', 'ejs');
app.set('views', path.join(dirname, 'views'));

app.use(express.static(path.join(dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

const connectionString = 'postgresql://projectvault:haha@localhost:5432/postgres';

app.get("/", (req, res) => {
    const filePath = path.join(dirname, 'public', 'project.html');
    console.log("Resolved file path:", filePath);
    res.sendFile(filePath);
});

app.get("/comments", async (req, res) => {
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('SELECT id, full_name, message FROM feedback');
        const comments = queryResult.rows;

        // Render the CRUD EJS template
        res.render('crud', { comments });
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            client.end();
        }
    }
});

app.post("/comments", async (req, res) => {
    const { full_name, message } = req.body;

    if (!full_name || !message) {
        return res.status(400).json({ error: "Full name and message are required." });
    }

    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();

        const queryResult = await client.query('INSERT INTO Feedback (full_name, message) VALUES ($1, $2)', [full_name, message]);
        console.log("Comment added successfully");
        res.redirect("/comments");
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    } finally {
        if (client) {
            client.end();
        }
    }
});

app.get("/comments/:id/edit", async (req, res) => {
    const commentId = req.params.id;

    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('SELECT id, full_name, message FROM feedback WHERE id = $1', [commentId]);
        const comment = queryResult.rows[0];

        // Render the edit-comment EJS template
        res.render('edit-comment', { comment });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    } finally {
        if (client) {
            client.end();
        }
    }
});

app.post('/comments/:id', async (req, res) => {
    const commentId = req.params.id;
    const { editName, editMessage } = req.body;

    try {
        const client = new Client({
            connectionString: connectionString
        });

        await client.connect();

        const query = 'UPDATE feedback SET full_name = $1, message = $2 WHERE id = $3';
        const values = [editName, editMessage, commentId];

        await client.query(query, values);

        await client.end(); // Close the connection

        console.log('Comment updated successfully');
        res.redirect('/comments'); // Redirect to the comments page
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.delete('/comments/:id', async (req, res) => {
    const commentId = req.params.id;
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('DELETE FROM feedback WHERE id = $1', [commentId]);
        console.log('Comment deleted successfully');
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        if (client) {
            client.end();
        }
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});