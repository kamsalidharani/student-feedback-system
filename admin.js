document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const feedbackListContainer = document.getElementById('feedbackListContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const viewDashboardBtn = document.getElementById('viewDashboard');
    const goBackBtn = document.getElementById('goBack');
    const logoutBtn = document.getElementById('logout');

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
            if (data.token && data.role === 'admin') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                loginContainer.style.display = 'none';
                feedbackListContainer.style.display = 'block';
                dashboardContainer.style.display = 'none';
                loadFeedbackList();
                document.getElementById('loginMessage').textContent = '';
                document.getElementById('loginError').textContent = '';
            } else {
                document.getElementById('loginError').textContent = 'Invalid email or password';
            }
        });
    });
    
    viewDashboardBtn.addEventListener('click', () => {
        fetch('http://localhost:5000/faculty-ratings')
        .then(response => response.json())
        .then(data => {
            const dashboard = document.getElementById('dashboard');
            dashboard.innerHTML = '';
            data.forEach(faculty => {
                const percentage = (faculty.averageRating * 20).toFixed(2); // Convert rating to percentage
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.width = `${percentage}%`;
                bar.textContent = `${faculty._id} - ${percentage}%`;
                dashboard.appendChild(bar);
            });
            dashboardContainer.style.display = 'block';
            feedbackListContainer.style.display = 'none';
        });
    });
    

    goBackBtn.addEventListener('click', () => {
        dashboardContainer.style.display = 'none';
        feedbackListContainer.style.display = 'block';
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        feedbackListContainer.style.display = 'none';
        dashboardContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    function loadFeedbackList() {
        fetch('http://localhost:5000/feedbacks')
        .then(response => response.json())
        .then(data => {
            const feedbackList = document.getElementById('feedbackList');
            feedbackList.innerHTML = '';
            data.forEach(feedback => {
                const listItem = document.createElement('div');
                listItem.className = 'feedback-item';
                listItem.innerHTML = `
                    <p><strong>Faculty:</strong> ${feedback.facultyName}</p>
                    <p><strong>Subject:</strong> ${feedback.subject}</p>
                    <p><strong>Rating:</strong> ${feedback.rating}</p>
                    <p><strong>Comments:</strong> "${feedback.comments}"</p>
                `;
                feedbackList.appendChild(listItem);
            });
        });
    }

    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role === 'admin') {
        loginContainer.style.display = 'none';
        feedbackListContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        loadFeedbackList();
    }
});






