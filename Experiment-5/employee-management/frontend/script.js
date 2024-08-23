document.addEventListener('DOMContentLoaded', async () => {
    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:3000/employees');
            return response.json();
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const addEmployeeButton = document.getElementById('addEmployeeButton');
    const employeeInfoButton = document.getElementById('employeeInfoButton');
    const employeeInfoSection = document.getElementById('employeeInfoSection');
    const employeeList = document.getElementById('employeeList');
    const addEmployeeModal = document.getElementById('addEmployeeModal');
    const addEmployeeForm = document.getElementById('addEmployeeForm');
    const editEmployeeModal = document.getElementById('editEmployeeModal');
    const editEmployeeForm = document.getElementById('editEmployeeForm');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    let employees = await fetchEmployees();
    let filteredEmployees = employees;

    const renderEmployeeList = (employees) => {
        employeeList.innerHTML = '';
        employees.forEach(emp => {
            const employeeItem = document.createElement('div');
            employeeItem.classList.add('employee-item');
            employeeItem.innerHTML = `
                <div><strong>Name:</strong> ${emp.firstName} ${emp.lastName}</div>
                <div><strong>Email:</strong> ${emp.email}</div>
                <div><strong>Salary:</strong> ${emp.salary}</div>
                <button class="editEmployeeButton" data-id="${emp.id}">Edit</button>
                <button class="deleteEmployeeButton" data-id="${emp.id}">Delete</button>
            `;
            employeeList.appendChild(employeeItem);
        });
    };

    const refreshData = async () => {
        employees = await fetchEmployees();
        filteredEmployees = employees;
        renderEmployeeList(filteredEmployees);
    };

    employeeInfoButton.addEventListener('click', () => {
        employeeInfoSection.classList.toggle('hidden');
        if (!employeeInfoSection.classList.contains('hidden')) {
            renderEmployeeList(filteredEmployees);
        }
    });

    addEmployeeButton.addEventListener('click', () => {
        addEmployeeModal.classList.remove('hidden');
    });

    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.toLowerCase();
        filteredEmployees = employees.filter(emp =>
            `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm)
        );
        renderEmployeeList(filteredEmployees);
    });

    addEmployeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addEmployeeForm);
        const values = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:3000/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            await response.json();
            await refreshData();
            addEmployeeModal.classList.add('hidden');
            addEmployeeForm.reset();
        } catch (error) {
            console.error('Error adding employee:', error);
        }
    });

    employeeList.addEventListener('click', async (e) => {
        const target = e.target;
        const employeeId = target.getAttribute('data-id');
        
        if (target.classList.contains('deleteEmployeeButton')) {
            try {
                await fetch(`http://localhost:3000/employees/${employeeId}`, {
                    method: 'DELETE'
                });
                await refreshData();
            } catch (error) {
                console.error('Error deleting employee:', error);
            }
        } else if (target.classList.contains('editEmployeeButton')) {
            const employee = employees.find(emp => emp.id === parseInt(employeeId));
            populateEditForm(employee);
            editEmployeeModal.classList.remove('hidden');
        }
    });

    const populateEditForm = (employee) => {
        for (const [key, value] of Object.entries(employee)) {
            if (editEmployeeForm.elements[key]) {
                editEmployeeForm.elements[key].value = value;
            }
        }
        editEmployeeForm.setAttribute('data-id', employee.id);
    };

    editEmployeeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeId = editEmployeeForm.getAttribute('data-id');
        const formData = new FormData(editEmployeeForm);
        const values = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`http://localhost:3000/employees/${employeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            await response.json();
            await refreshData();
            editEmployeeModal.classList.add('hidden');
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    });

    document.querySelectorAll('.cancel').forEach(button => {
        button.addEventListener('click', () => {
            addEmployeeModal.classList.add('hidden');
            editEmployeeModal.classList.add('hidden');
        });
    });

    refreshData();
});
