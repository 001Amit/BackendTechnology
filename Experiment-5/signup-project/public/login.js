document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username: username,
                    password: password
                }).toString()
            })
            .then(response => {
                if (response.ok) {
                    alert('Login successful!');
                    window.location.href = 'index.html'; // Redirect to a success page or dashboard
                } else {
                    disableLoginButton(); // Disable the login button on failure
                    alert('Invalid username or password');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    }

    function disableLoginButton() {
        const button = document.querySelector('#loginForm button');
        button.classList.add('disabled');
        button.setAttribute('disabled', true);
    }
});
