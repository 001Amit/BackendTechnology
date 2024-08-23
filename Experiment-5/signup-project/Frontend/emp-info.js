document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();

    // Event listener for Edit buttons
    document.getElementById('employeeList').addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const employeeId = e.target.dataset.id;
            fetchEmployeeData(employeeId);
        } else if (e.target.classList.contains('delete-btn')) {
            const employeeId = e.target.dataset.id;
            deleteEmployee(employeeId);
        }
    });

    // Event listener for Update button in edit form
    document.getElementById('updateEmployeeBtn').addEventListener('click', updateEmployee);
});

function loadEmployees() {
    fetch('http://localhost:3000/employees')
        .then(response => response.json())
        .then(data => {
            const employeeList = document.getElementById('employeeList');
            employeeList.innerHTML = ''; // Clear existing list
            data.forEach(employee => {
                employeeList.innerHTML += `
                    <li>
                        ${employee.firstName} ${employee.lastName} - ${employee.email} 
                        <button class="edit-btn" data-id="${employee.id}">Edit</button>
                        <button class="delete-btn" data-id="${employee.id}">Delete</button>
                    </li>`;
            });
        });
}

function fetchEmployeeData(employeeId) {
    fetch(`http://localhost:3000/employees/${employeeId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('editEmployeeId').value = data.id;
            document.getElementById('editFirstName').value = data.firstName;
            document.getElementById('editLastName').value = data.lastName;
            document.getElementById('editEmail').value = data.email;
            document.getElementById('editContactNumber').value = data.contactNumber;
            document.getElementById('editDob').value = data.dob;
            document.getElementById('editAddress').value = data.address;
            document.getElementById('editSalary').value = data.salary;

            document.getElementById('editEmployeeForm').style.display = 'block';
        });
}

function updateEmployee() {
    const employeeId = document.getElementById('editEmployeeId').value;
    const updatedEmployee = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        contactNumber: document.getElementById('editContactNumber').value,
        dob: document.getElementById('editDob').value,
        address: document.getElementById('editAddress').value,
        salary: document.getElementById('editSalary').value
    };

    fetch(`http://localhost:3000/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEmployee),
    })
    .then(response => {
        if (response.ok) {
            loadEmployees();
            document.getElementById('editEmployeeForm').style.display = 'none';
        } else {
            console.error('Failed to update employee');
        }
    });
}

function deleteEmployee(employeeId) {
    fetch(`http://localhost:3000/employees/${employeeId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadEmployees();
        } else {
            console.error('Failed to delete employee');
        }
    });
}
