const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // To serve static files

const dataFilePath = './employees.json'; // Path to your employees.json file

// Load data from JSON file
const loadData = () => {
  try {
    const dataBuffer = fs.readFileSync(dataFilePath);
    return JSON.parse(dataBuffer.toString());
  } catch (error) {
    return [];
  }
};

// Save data to JSON file
const saveData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

// Create (POST)
app.post('/create', (req, res) => {
  const newData = req.body;
  const data = loadData();
  newData.id = data.length ? data[data.length - 1].id + 1 : 1; // Assign a new ID
  data.push(newData);
  saveData(data);
  res.status(201).send(newData);
});

// Read (GET)
app.get('/read', (req, res) => {
  const data = loadData();
  res.send(data);
});

// Update (PUT)
app.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  let data = loadData();
  data = data.map((item) => (item.id === parseInt(id) ? { ...item, ...updatedData } : item));
  saveData(data);
  res.send(updatedData);
});

// Delete (DELETE)
app.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  let data = loadData();
  data = data.filter((item) => item.id !== parseInt(id));
  saveData(data);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
