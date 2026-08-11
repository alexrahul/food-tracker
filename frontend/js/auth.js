const API = 'https://food-tracker-isz1.onrender.com/api';

const form = document.querySelector('form');
const message = document.querySelector('#msg');

if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            let data;

            // -------------------------------
            // REGISTER
            // -------------------------------
            if (form.id === 'registerForm') {

                const name = document.querySelector('#name').value.trim();
                const email = document.querySelector('#email').value.trim();
                const password = document.querySelector('#password').value;

                if (!name || !email || password.length < 8) {
                    throw new Error(
                        'Name, email and 8+ character password are required'
                    );
                }

                data = {
                    name: name,
                    email: email,
                    password: password
                };
            }

            // -------------------------------
            // LOGIN
            // -------------------------------
            else if (form.id === 'loginForm') {

                const email = document.querySelector('#email').value.trim();
                const password = document.querySelector('#password').value;

                if (!email || !password) {
                    throw new Error(
                        'Email and password are required'
                    );
                }

                data = {
                    email: email,
                    password: password
                };
            }

            // -------------------------------
            // SEND REQUEST
            // -------------------------------

            const endpoint =
                form.id === 'registerForm'
                    ? '/auth/register'
                    : '/auth/login';

            const response = await fetch(API + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || 'Request failed'
                );
            }

            // -------------------------------
            // SAVE LOGIN INFORMATION
            // -------------------------------

            localStorage.setItem(
                'foodToken',
                result.token
            );

            localStorage.setItem(
                'foodUser',
                JSON.stringify(result.user)
            );

            // -------------------------------
            // REDIRECT
            // -------------------------------

            if (
                result.user &&
                result.user.role === 'admin'
            ) {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }

        } catch (error) {

            console.error('Authentication error:', error);

            if (message) {
                message.textContent = error.message;
                message.className = 'err';
            }
        }
    });
}