const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse the body of the request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Function to read users from file
const readUsersFromFile = () => {
    if (fs.existsSync('users.txt')) {
        const data = fs.readFileSync('users.txt', 'utf8');
        return data.split('\n\n').filter(block => block).map(block => {
            const [id, username, email, password, additional] = block.split('\n').map(line => line.split(': ')[1]);
            return { id, username, email, password, additional };
        });
    }
    return [];
};

// Function to write users to file
const writeUsersToFile = (users) => {
    const data = users.map(user => `ID: ${user.id}\nUsername: ${user.username}\nEmail: ${user.email}\nPassword: ${user.password}\nAdditional Info: ${user.additional}`).join('\n\n');
    fs.writeFileSync('users.txt', data, 'utf8');
};

// Serve the signup form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create: Handle the form submission
app.post('/signup', (req, res) => {
    const { userid, username, email, password, additional } = req.body;
    const users = readUsersFromFile();

    const newUser = { id: userid, username, email, password, additional };
    users.push(newUser);
    writeUsersToFile(users);

    res.send('Signup successful!');
});

// Read: Display all users
app.get('/users', (req, res) => {
    const users = readUsersFromFile();
    res.json(users);
});

// Update: Update a user's details
app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, password, additional } = req.body;
    const users = readUsersFromFile();

    const userIndex = users.findIndex(user => user.id == id);
    if (userIndex === -1) {
        return res.status(404).send('User not found');
    }

    users[userIndex] = { id, username, email, password, additional };
    writeUsersToFile(users);

    res.send('User updated successfully!');
});

// Delete: Delete a user
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    const users = readUsersFromFile();

    const userIndex = users.findIndex(user => user.id == id);
    if (userIndex === -1) {
        return res.status(404).send('User not found');
    }

    users.splice(userIndex, 1);
    writeUsersToFile(users);

    res.send('User deleted successfully!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
