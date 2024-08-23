document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent form submission

            const username = document.getElementById('signupUsername').value;
            const password = document.getElementById('signupPassword').value;

            const usernamePattern = /^[a-zA-Z][a-zA-Z0-9]*$/;
            const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if (!usernamePattern.test(username)) {
                alert('Username must start with a letter and can only contain letters and numbers.');
                return; // Prevent further action
            }

            if (!passwordPattern.test(password)) {
                alert('Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
                return; // Prevent further action
            }

            // If validation passes, submit the form via fetch
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(new FormData(signupForm)).toString(),
            })
            .then(response => {
                if (response.ok) {
                    alert('Successfully registered! Redirecting to login page...');
                    window.location.href = 'login.html'; // Redirect to login page
                } else {
                    return response.text().then(text => alert(text)); // Show error message
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            if (username === '' || password === '') {
                alert('Please fill in all fields.');
                event.preventDefault(); // Prevent form submission
            }
        });
    }
});
