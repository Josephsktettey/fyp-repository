// ===== FYP REPOSITORY - FRONTEND JAVASCRIPT =====

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzPQn5t_NOVwlNeyAz1lJh2S7xWmXgveY",
    authDomain: "fyp-repository-8edaa.firebaseapp.com",
    databaseURL: "https://fyp-repository-8edaa-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "fyp-repository-8edaa",
    storageBucket: "fyp-repository-8edaa.firebasestorage.app",
    messagingSenderId: "848573587059",
    appId: "1:848573587059:web:219c2d43952e89461d5406"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// ===== HAMBURGER MENU =====
// ===== HAMBURGER MENU =====
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    navLinks.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }
});

// ===== PAGE TRANSITION =====
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && !link.href.startsWith('#') && link.target !== '_blank') {
        e.preventDefault();
        document.body.style.animation = 'none';
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateY(-15px)';
        document.body.style.transition = 'all 0.15s ease';
        setTimeout(() => {
            window.location.href = link.href;
        }, 150);
    }
});

// ===== LOAD TOPICS ON HOMEPAGE =====
function loadTopics() {
    const topicsGrid = document.getElementById('topicsGrid');
    if (!topicsGrid) return;

    const topicsRef = database.ref('topics');

    topicsRef.on('value', (snapshot) => {
        topicsGrid.innerHTML = '';

        if (!snapshot.exists()) {
            topicsGrid.innerHTML = '<p class="loading-text">No topics found. Be the first to submit one.</p>';
            return;
        }

        const topicsArray = [];
        snapshot.forEach((childSnapshot) => {
            topicsArray.push(childSnapshot.val());
        });

        topicsArray.slice(0, 6).forEach((topic) => {
            const card = createTopicCard(topic);
            topicsGrid.appendChild(card);
        });
    });
}

// ===== CREATE TOPIC CARD =====
function createTopicCard(topic) {
    const card = document.createElement('div');
    card.classList.add('topic-card', topic.status);
    card.innerHTML = `
        <div class="card-header">
            <span class="card-department">${topic.department}</span>
            <span class="card-year">${topic.year}</span>
        </div>
        <h3 class="card-title">${topic.title}</h3>
        <p class="card-description">${topic.description || 'No description provided.'}</p>
        <div class="card-footer">
            <span class="card-status ${topic.status}">${topic.status}</span>
        </div>
    `;
    return card;
}

// ===== SEARCH TOPICS =====
function searchTopics() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    const topicsGrid = document.getElementById('topicsGrid');

    if (!searchInput) {
        loadTopics();
        return;
    }

    topicsGrid.innerHTML = '<p class="loading-text">Searching...</p>';

    database.ref('topics').once('value', (snapshot) => {
        topicsGrid.innerHTML = '';

        if (!snapshot.exists()) {
            topicsGrid.innerHTML = '<p class="loading-text">No topics found.</p>';
            return;
        }

        let found = 0;

        snapshot.forEach((childSnapshot) => {
            const topic = childSnapshot.val();
            const title = topic.title.toLowerCase();
            const department = topic.department.toLowerCase();
            const description = topic.description ? topic.description.toLowerCase() : '';

            if (title.includes(searchInput) || department.includes(searchInput) || description.includes(searchInput)) {
                const card = createTopicCard(topic);
                topicsGrid.appendChild(card);
                found++;
            }
        });

        if (found === 0) {
            topicsGrid.innerHTML = '<p class="loading-text">No topics match your search.</p>';
        }
    });
}

// ===== FILTER BY DEPARTMENT =====
function filterByDepartment() {
    const department = document.getElementById('departmentFilter').value;
    const topicsGrid = document.getElementById('topicsGrid');

    if (!department) {
        loadTopics();
        return;
    }

    topicsGrid.innerHTML = '<p class="loading-text">Filtering...</p>';

    database.ref('topics').orderByChild('department').equalTo(department).once('value', (snapshot) => {
        topicsGrid.innerHTML = '';

        if (!snapshot.exists()) {
            topicsGrid.innerHTML = '<p class="loading-text">No topics found for this department.</p>';
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const topic = childSnapshot.val();
            if (topic.status === 'approved') {
                const card = createTopicCard(topic);
                topicsGrid.appendChild(card);
            }
        });
    });
}

// ===== LOGIN USER =====
function loginUser() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = '';

    if (!email || !password) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
}

// ===== REGISTER USER =====
function registerUser() {
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const department = document.getElementById('department').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    errorMessage.textContent = '';
    successMessage.textContent = '';

    if (!fullname || !email || !department || !role || !password || !confirmPassword) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters.';
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return database.ref('users/' + user.uid).set({
                fullname: fullname,
                email: email,
                department: department,
                role: role,
                createdAt: new Date().toISOString()
            });
        })
        .then(() => {
            successMessage.textContent = 'Account created successfully! Redirecting to login...';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        })
        .catch((error) => {
            errorMessage.textContent = error.message;
        });
}

// ===== LOGOUT USER =====
function logoutUser() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}

// ===== LOAD DASHBOARD =====
function loadDashboard() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        database.ref('users/' + user.uid).once('value', (snapshot) => {
            const userData = snapshot.val();
            document.getElementById('welcome-text').textContent = 'Welcome back, ' + userData.fullname + '!';
            document.getElementById('user-name').textContent = userData.fullname;

            if (userData.role === 'admin') {
                const adminLink = document.getElementById('admin-link');
                if (adminLink) adminLink.style.display = 'block';
            }

            if (userData.role === 'student') {
                loadStudentTopics(user.uid);
            } else if (userData.role === 'supervisor') {
                loadSupervisorTopics(userData.department);
            } else if (userData.role === 'admin') {
                loadAllTopics();
            }
        });
    });
}

// ===== LOAD STUDENT TOPICS =====
function loadStudentTopics(uid) {
    database.ref('topics').orderByChild('submittedByUid').equalTo(uid).on('value', (snapshot) => {
        const tableBody = document.getElementById('topics-table-body');
        tableBody.innerHTML = '';

        let total = 0, approved = 0, pending = 0, rejected = 0;

        if (!snapshot.exists()) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading-text">You have not submitted any topics yet.</td></tr>';
            updateStats(0, 0, 0, 0);
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const topic = childSnapshot.val();
            const key = childSnapshot.key;
            total++;
            if (topic.status === 'approved') approved++;
            if (topic.status === 'pending') pending++;
            if (topic.status === 'rejected') rejected++;

            const row = `
                <tr>
                    <td>${topic.title}</td>
                    <td>${topic.department}</td>
                    <td>${topic.submittedBy}</td>
                    <td>${new Date(topic.createdAt).toLocaleDateString()}</td>
                    <td><span class="badge ${topic.status}">${topic.status}</span></td>
                    <td>
                        <button class="btn-small btn-danger" onclick="deleteTopic('${key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        updateStats(total, approved, pending, rejected);
    });
}

// ===== LOAD SUPERVISOR TOPICS =====
function loadSupervisorTopics(department) {
    database.ref('topics').orderByChild('department').equalTo(department).on('value', (snapshot) => {
        const tableBody = document.getElementById('topics-table-body');
        tableBody.innerHTML = '';

        let total = 0, approved = 0, pending = 0, rejected = 0;

        if (!snapshot.exists()) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading-text">No topics found in your department.</td></tr>';
            updateStats(0, 0, 0, 0);
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const topic = childSnapshot.val();
            const key = childSnapshot.key;
            total++;
            if (topic.status === 'approved') approved++;
            if (topic.status === 'pending') pending++;
            if (topic.status === 'rejected') rejected++;

            const row = `
                <tr>
                    <td>${topic.title}</td>
                    <td>${topic.department}</td>
                    <td>${topic.submittedBy}</td>
                    <td>${new Date(topic.createdAt).toLocaleDateString()}</td>
                    <td><span class="badge ${topic.status}">${topic.status}</span></td>
                    <td class="action-buttons">
                        ${topic.status === 'pending' ? `
                            <button class="btn-small btn-approve" onclick="approveTopic('${key}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-small btn-reject" onclick="rejectTopic('${key}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        updateStats(total, approved, pending, rejected);
    });
}

// ===== LOAD ALL TOPICS ADMIN =====
function loadAllTopics() {
    database.ref('topics').on('value', (snapshot) => {
        const tableBody = document.getElementById('topics-table-body');
        tableBody.innerHTML = '';

        let total = 0, approved = 0, pending = 0, rejected = 0;

        if (!snapshot.exists()) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading-text">No topics found.</td></tr>';
            updateStats(0, 0, 0, 0);
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const topic = childSnapshot.val();
            const key = childSnapshot.key;
            total++;
            if (topic.status === 'approved') approved++;
            if (topic.status === 'pending') pending++;
            if (topic.status === 'rejected') rejected++;

            const row = `
                <tr>
                    <td>${topic.title}</td>
                    <td>${topic.department}</td>
                    <td>${topic.submittedBy}</td>
                    <td>${new Date(topic.createdAt).toLocaleDateString()}</td>
                    <td><span class="badge ${topic.status}">${topic.status}</span></td>
                    <td class="action-buttons">
                        ${topic.status === 'pending' ? `
                            <button class="btn-small btn-approve" onclick="approveTopic('${key}')">
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-small btn-reject" onclick="rejectTopic('${key}')">
                                <i class="fas fa-times"></i> Reject
                            </button>
                        ` : ''}
                        <button class="btn-small btn-danger" onclick="deleteTopic('${key}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });

        updateStats(total, approved, pending, rejected);
    });
}

// ===== UPDATE STATS =====
function updateStats(total, approved, pending, rejected) {
    document.getElementById('total-topics').textContent = total;
    document.getElementById('approved-topics').textContent = approved;
    document.getElementById('pending-topics').textContent = pending;
    document.getElementById('rejected-topics').textContent = rejected;
}

// ===== APPROVE TOPIC =====
function approveTopic(key) {
    if (confirm('Approve this topic?')) {
        database.ref('topics/' + key).update({ status: 'approved' })
            .then(() => alert('Topic approved successfully.'))
            .catch((error) => alert('Error: ' + error.message));
    }
}

// ===== REJECT TOPIC =====
function rejectTopic(key) {
    if (confirm('Reject this topic?')) {
        database.ref('topics/' + key).update({ status: 'rejected' })
            .then(() => alert('Topic rejected successfully.'))
            .catch((error) => alert('Error: ' + error.message));
    }
}

// ===== DELETE TOPIC =====
function deleteTopic(key) {
    if (confirm('Are you sure you want to delete this topic?')) {
        database.ref('topics/' + key).remove()
            .then(() => alert('Topic deleted successfully.'))
            .catch((error) => alert('Error: ' + error.message));
    }
}

// ===== SUBMIT TOPIC =====
function submitTopic() {
    const title = document.getElementById('title').value.trim();
    const department = document.getElementById('department').value;
    const year = document.getElementById('year').value;
    const description = document.getElementById('description').value.trim();
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    errorMessage.textContent = '';
    successMessage.textContent = '';

    if (!title || !department || !year || !description) {
        errorMessage.textContent = 'Please fill in all fields.';
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    database.ref('topics').once('value', (snapshot) => {
        let isDuplicate = false;

        snapshot.forEach((childSnapshot) => {
            const topic = childSnapshot.val();
            if (topic.title.toLowerCase() === title.toLowerCase()) {
                isDuplicate = true;
            }
        });

        if (isDuplicate) {
            errorMessage.textContent = 'This topic title already exists. Please choose a different title.';
            return;
        }

        database.ref('users/' + user.uid).once('value', (userSnapshot) => {
            const userData = userSnapshot.val();

            database.ref('topics').push({
                title: title,
                department: department,
                year: year,
                description: description,
                submittedBy: userData.fullname,
                submittedByUid: user.uid,
                status: 'pending',
                createdAt: new Date().toISOString()
            }).then(() => {
                successMessage.textContent = 'Topic submitted successfully! Redirecting to dashboard...';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            }).catch((error) => {
                errorMessage.textContent = error.message;
            });
        });
    });
}

// ===== LOAD ADMIN PANEL =====
function loadAdminPanel() {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        database.ref('users/' + user.uid).once('value', (snapshot) => {
            const userData = snapshot.val();

            if (userData.role !== 'admin') {
                window.location.href = 'dashboard.html';
                return;
            }

            const userNameEl = document.getElementById('user-name');
            if (userNameEl) userNameEl.textContent = userData.fullname;

            loadAllUsers();
        });
    });
}

// ===== LOAD ALL USERS =====
function loadAllUsers() {
    database.ref('users').on('value', (snapshot) => {
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '';

        if (!snapshot.exists()) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading-text">No users found.</td></tr>';
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            const uid = childSnapshot.key;

            const row = `
                <tr>
                    <td>${user.fullname}</td>
                    <td>${user.email}</td>
                    <td>${user.department}</td>
                    <td>
                        <select class="role-select" onchange="updateUserRole('${uid}', this.value)">
                            <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                            <option value="supervisor" ${user.role === 'supervisor' ? 'selected' : ''}>Supervisor</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-small btn-danger" onclick="deleteUser('${uid}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    });
}

// ===== UPDATE USER ROLE =====
function updateUserRole(uid, newRole) {
    database.ref('users/' + uid).update({ role: newRole })
        .then(() => alert('User role updated successfully.'))
        .catch((error) => alert('Error: ' + error.message));
}

// ===== DELETE USER =====
function deleteUser(uid) {
    if (confirm('Are you sure you want to delete this user?')) {
        database.ref('users/' + uid).remove()
            .then(() => alert('User deleted successfully.'))
            .catch((error) => alert('Error: ' + error.message));
    }
}

// ===== BROWSE PAGE =====
let allTopics = [];
let currentPage = 1;
const topicsPerPage = 20;

function loadBrowseTopics() {
    database.ref('topics').once('value', (snapshot) => {
        allTopics = [];

        if (!snapshot.exists()) {
            document.getElementById('browse-table-body').innerHTML = '<tr><td colspan="5" class="loading-text">No topics found.</td></tr>';
            return;
        }

        snapshot.forEach((childSnapshot) => {
            allTopics.push(childSnapshot.val());
        });

        document.getElementById('topics-count').textContent = `${allTopics.length} topics found`;
        renderBrowseTable(allTopics);
    });
}

function renderBrowseTable(topics) {
    const tableBody = document.getElementById('browse-table-body');
    const pagination = document.getElementById('pagination');
    tableBody.innerHTML = '';

    if (topics.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="loading-text">No topics match your search.</td></tr>';
        pagination.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(topics.length / topicsPerPage);
    const start = (currentPage - 1) * topicsPerPage;
    const end = start + topicsPerPage;
    const pageTopics = topics.slice(start, end);

    pageTopics.forEach((topic, index) => {
        const row = `
            <tr>
                <td>${start + index + 1}</td>
                <td>${topic.title}</td>
                <td>${topic.department}</td>
                <td>${topic.year}</td>
                <td><span class="badge ${topic.status}">${topic.status}</span></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });

    pagination.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.classList.add('page-btn');
        if (i === currentPage) btn.classList.add('active');
        btn.textContent = i;
        btn.onclick = () => {
            currentPage = i;
            renderBrowseTable(topics);
        };
        pagination.appendChild(btn);
    }
}

function filterBrowse() {
    const search = document.getElementById('browseSearch').value.toLowerCase();
    const year = document.getElementById('browseYear').value;
    const status = document.getElementById('browseStatus').value;

    const filtered = allTopics.filter((topic) => {
        const matchSearch = topic.title.toLowerCase().includes(search);
        const matchYear = year ? topic.year === year : true;
        const matchStatus = status ? topic.status === status : true;
        return matchSearch && matchYear && matchStatus;
    });

    document.getElementById('topics-count').textContent = `${filtered.length} topics found`;
    currentPage = 1;
    renderBrowseTable(filtered);
}

// ===== INITIALIZE PAGE =====
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    const page = window.location.pathname;

    if (page.includes('dashboard')) {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            loadDashboard();
        });
    } else if (page.includes('submit')) {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            database.ref('users/' + user.uid).once('value', (snapshot) => {
                const userData = snapshot.val();
                const userNameEl = document.getElementById('user-name');
                if (userNameEl) userNameEl.textContent = userData.fullname;
            });
        });
    } else if (page.includes('admin')) {
        loadAdminPanel();
    } else if (page.includes('browse')) {
        loadBrowseTopics();
    } else {
        loadTopics();
    }
});