const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'public', 'users.txt');
const DATA_FILE = path.join(__dirname, 'frontend', 'employees.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
// Route to serve the default page (signup.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});


app.use(express.static(path.join(__dirname, 'frontend')));


// Helper function to hash passwords
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Route to handle signup
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    const usernamePattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!usernamePattern.test(username)) {
        return res.status(400).send('Username must start with a letter and can only contain letters and numbers.');
    }

    if (!passwordPattern.test(password)) {
        return res.status(400).send('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
    }

    const hashedPassword = hashPassword(password);

    fs.appendFile(USERS_FILE, `${username}:${hashedPassword}\n`, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).send('Server error.');
        }
        res.sendStatus(200); // Success status code
    });
});

// Route to handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = hashPassword(password);

    fs.readFile(USERS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Server error.');
        }

        const users = data.split('\n').reduce((acc, line) => {
            const [user, pass] = line.split(':');
            if (user && pass) acc[user] = pass;
            return acc;
        }, {});

        if (users[username] === hashedPassword) {
            res.sendStatus(200); // Login successful
        } else {
            res.status(401).send('Invalid username or password'); // Unauthorized
        }
    });
});

// Helper functions for employee data management
const readEmployeeData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([])); // Initialize with empty array if not present
        }
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading employee data:", error);
        return [];
    }
};

const writeEmployeeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing employee data:", error);
    }
};

const isValidEmployee = (employee) => {
    const { firstName, lastName, email, contactNumber, dob, address, salary } = employee;
    return firstName && lastName && email && contactNumber && dob && address && salary;
};

// Employee management routes
app.get('/employees', (req, res) => {
    const employees = readEmployeeData();
    res.json(employees);
});

app.get('/employees/:id', (req, res) => {
    const employees = readEmployeeData();
    const employee = employees.find(emp => emp.id === parseInt(req.params.id));
    if (employee) {
        res.json(employee);
    } else {
        res.status(404).send('Employee not found');
    }
});

app.post('/employees', (req, res) => {
    const employees = readEmployeeData();
    const newEmployee = req.body;

    if (!isValidEmployee(newEmployee)) {
        return res.status(400).send('Invalid employee data');
    }

    newEmployee.id = employees.length ? employees[employees.length - 1].id + 1 : 1;
    employees.push(newEmployee);
    writeEmployeeData(employees);
    res.status(201).json(newEmployee);
});

app.put('/employees/:id', (req, res) => {
    const employees = readEmployeeData();
    const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));

    if (employeeIndex !== -1) {
        const updatedEmployee = { ...employees[employeeIndex], ...req.body };

        if (!isValidEmployee(updatedEmployee)) {
            return res.status(400).send('Invalid employee data');
        }

        employees[employeeIndex] = updatedEmployee;
        writeEmployeeData(employees);
        res.json(updatedEmployee);
    } else {
        res.status(404).send('Employee not found');
    }
});

app.delete('/employees/:id', (req, res) => {
    const employees = readEmployeeData();
    const newEmployees = employees.filter(emp => emp.id !== parseInt(req.params.id));
    if (newEmployees.length !== employees.length) {
        writeEmployeeData(newEmployees);
        res.status(204).send();
    } else {
        res.status(404).send('Employee not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
