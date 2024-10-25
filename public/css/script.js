const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loadingSpinner = document.getElementById('loadingSpinner');


// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function () {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.textContent = this.textContent === 'visibility' ? 'visibility_off' : 'visibility';
});

// Enable/disable login button based on field input
loginForm.addEventListener('input', function () {
    if (username.value && password.value) {
        loginBtn.removeAttribute('disabled');
    } else {
        loginBtn.setAttribute('disabled', 'true');
    }
});

// Handle form submission
loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();


    // Reset error messages
    document.getElementById('usernameError').textContent = "";
    document.getElementById('passwordError').textContent = "";
    document.getElementById('usernameError').style.display = 'none';
    document.getElementById('passwordError').style.display = 'none';

    // Basic form validation
    let hasError = false;

    if (!username.value) {
        loadingSpinner.style.display = 'none'; 
        document.getElementById('usernameError').textContent = "Username is required";
        document.getElementById('usernameError').style.display = 'block';
        hasError = true;
    }
    if (!password.value) {
        loadingSpinner.style.display = 'none'; 
        document.getElementById('passwordError').textContent = "Password is required";
        document.getElementById('passwordError').style.display = 'block';
        hasError = true;
    }

    // If there are errors, do not proceed
    if (hasError) {
        return;
    }

    loadingSpinner.style.display = 'flex';


    try {
       // await new Promise((resolve) => setTimeout(resolve, 10000));
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username.value,
                password: password.value,
                rememberMe: document.getElementById('rememberMe').checked
            })
        });


        if (response.ok) {
            setTimeout(() => { 
                window.location.href = "/welcome"; 
            }, 1000);// Redirect on success
        } else {
            // Get error message from the response and display it
            const errorMessage = await response.text();
            alert(errorMessage); // Show the specific error message
        }
    } catch (error) {
        alert("Server unreachable, please try again later.");
    } finally {
        setTimeout(() => {
            loadingSpinner.style.display = 'none';
        }, 1000);
    }
});
