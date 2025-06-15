// Авторизация и регистрация
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация формы входа
    const loginForm = document.querySelector('#login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('#login-email').value;
            const password = this.querySelector('#login-password').value;
            
            loginUser(email, password);
        });
    }
    
    // Инициализация формы регистрации
    const registerForm = document.querySelector('#register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('#register-name').value;
            const email = this.querySelector('#register-email').value;
            const phone = this.querySelector('#register-phone').value;
            const password = this.querySelector('#register-password').value;
            const confirm = this.querySelector('#register-confirm').value;
            
            if (password !== confirm) {
                alert('Пароли не совпадают!');
                return;
            }
            
            registerUser(name, email, phone, password);
        });
    }
    
    // Выход из системы
    const logoutLinks = document.querySelectorAll('.logout-link');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    });
    
    // Загрузка профиля
    if (document.querySelector('#profile-name')) {
        loadProfile();
    }
});

// Вход пользователя
function loginUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        alert('Вы успешно вошли в систему!');
        
        // Перенаправляем на главную или профиль
        window.location.href = user.isAdmin ? 'admin.html' : 'profile.html';
    } else {
        alert('Неверный email или пароль!');
    }
}

// Регистрация пользователя
function registerUser(name, email, phone, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Проверяем, есть ли уже пользователь с таким email
    if (users.some(u => u.email === email)) {
        alert('Пользователь с таким email уже зарегистрирован!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        isAdmin: false,
        orders: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('user', JSON.stringify(newUser));
    
    alert('Регистрация прошла успешно!');
    window.location.href = 'profile.html';
}

// Выход пользователя
function logoutUser() {
    localStorage.removeItem('user');
    alert('Вы вышли из системы');
    window.location.href = 'index.html';
}

// Загрузка профиля
function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    document.querySelector('#profile-name').textContent = user.name;
    document.querySelector('#profile-email').textContent = user.email;
    document.querySelector('#profile-phone').textContent = user.phone;
    
    // Загрузка заказов
    const ordersList = document.querySelector('#orders-list');
    
    if (user.orders && user.orders.length > 0) {
        ordersList.innerHTML = user.orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Заказ #${order.id}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-status ${order.status === 'completed' ? 'status-completed' : 'status-pending'}">
                    ${order.status === 'completed' ? 'Завершен' : 'В обработке'}
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} (${item.quantity} шт.)</span>
                            <span>${item.price * item.quantity} руб.</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    Итого: ${order.items.reduce((total, item) => total + (item.price * item.quantity), 0)} руб.
                </div>
            </div>
        `).join('');
    } else {
        ordersList.innerHTML = '<p class="no-orders">У вас пока нет заказов</p>';
    }
    
    // Редактирование профиля
    document.querySelector('#edit-profile').addEventListener('click', function() {
        const name = prompt('Введите ваше имя', user.name);
        const phone = prompt('Введите ваш телефон', user.phone);
        
        if (name && phone) {
            // Обновляем данные в localStorage
            user.name = name;
            user.phone = phone;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Обновляем данные в базе пользователей
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex !== -1) {
                users[userIndex] = user;
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Обновляем отображение
            document.querySelector('#profile-name').textContent = user.name;
            document.querySelector('#profile-phone').textContent = user.phone;
            
            alert('Данные профиля обновлены!');
        }
    });
}