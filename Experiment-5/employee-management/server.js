const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'employees.json');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'frontend')));

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
