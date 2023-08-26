const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 9000;
let dirname='/home/ishwor/Desktop/Sunway/5thSem/Web technologies/Projects/Project Vault/'
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

app.post("/", async (req, res) => {
    const { full_name, message } = req.body;
    let client; // Declare the client variable here

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('INSERT INTO Feedback (full_name, message) VALUES ($1, $2)', [full_name, message]);
        console.log("Query Result:", queryResult);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            client.end();
        }
    }

    res.redirect("/");
});

app.get("/comments", async (req, res) => {
    let client;

    try {
        client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('SELECT full_name, message FROM Feedback');
        const comments = queryResult.rows;

        // Render the comment EJS template
        res.render('comment', { comments });
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            client.end();
        }
    }
});

app.get("/comments/:id", async (req, res) => {
    const commentId = req.params.id;

    try {
        const client = new Client({
            connectionString: connectionString
        });

        await client.connect();
        const queryResult = await client.query('SELECT id, message FROM Feedback WHERE id = $1', [commentId]);
        const comment = queryResult.rows[0];
        
        res.json(comment); // Send the comment data as JSON response
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "An error occurred" });
    } finally {
        if (client) {
            client.end();
        }
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});
