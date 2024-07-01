document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const logout = document.getElementById('logout');

    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.token && data.role === 'student') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('email', email);
                loginContainer.style.display = 'none';
                feedbackContainer.style.display = 'block';
                document.getElementById('studentEmailDisplay').textContent = `Logged in as: ${email}`;
                loadFacultiesAndSubjects();
                document.getElementById('loginMessage').textContent = '';
                document.getElementById('loginError').textContent = '';
            } else {
                document.getElementById('loginError').textContent = 'Invalid email or password';
            }
        });
    });

    document.getElementById('feedbackForm').addEventListener('submit', (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to submit feedback');
            return;
        }

        const facultyName = document.querySelector('input[name="facultyName"]:checked').value;
        const subject = document.querySelector('input[name="subject"]:checked').value;
        const rating = document.getElementById('rating').value;
        const comments = document.getElementById('comments').value;

        const feedback = {
            facultyName: facultyName,
            subject: subject,
            rating: rating,
            comments: comments
        };

        fetch('http://localhost:5000/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(feedback)
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                document.getElementById('responseMessage').textContent = data.message;
                document.getElementById('feedbackForm').reset();
                document.getElementById('feedbackError').textContent = '';
            } else {
                document.getElementById('feedbackError').textContent = 'Failed to submit feedback';
            }
        });
    });

    logout.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        feedbackContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    function loadFacultiesAndSubjects() {
        fetch('http://localhost:5000/faculties')
        .then(response => response.json())
        .then(faculties => {
            const facultyOptions = document.getElementById('facultyOptions');
            facultyOptions.innerHTML = '';
            faculties.forEach(faculty => {
                const label = document.createElement('label');
                label.textContent = faculty.name;
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'facultyName';
                input.value = faculty.name;
                facultyOptions.appendChild(label);
                facultyOptions.appendChild(input);
            });
        });

        fetch('http://localhost:5000/subjects')
        .then(response => response.json())
        .then(subjects => {
            const subjectOptions = document.getElementById('subjectOptions');
            subjectOptions.innerHTML = '';
            subjects.forEach(subject => {
                const label = document.createElement('label');
                label.textContent = subject.name;
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'subject';
                input.value = subject.name;
                subjectOptions.appendChild(label);
                subjectOptions.appendChild(input);
            });
        });
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (token && role === 'student') {
        loginContainer.style.display = 'none';
        feedbackContainer.style.display = 'block';
        document.getElementById('studentEmailDisplay').textContent = `Logged in as: ${email}`;
        loadFacultiesAndSubjects();
    }
});



