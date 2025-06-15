// Админ панель
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Проверяем, является ли пользователь админом
    if (!user || !user.isAdmin) {
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализация вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Убираем активные классы
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активные классы
            this.classList.add('active');
            document.querySelector(`#${tabId}-tab`).classList.add('active');
            
            // Загружаем данные для вкладки
            if (tabId === 'products') {
                loadAdminProducts();
            } else if (tabId === 'orders') {
                loadAdminOrders();
            } else if (tabId === 'users') {
                loadAdminUsers();
            }
        });
    });
    
    // Инициализация модального окна
    const modal = document.querySelector('#product-modal');
    const addProductBtn = document.querySelector('#add-product-btn');
    const closeBtn = document.querySelector('.close');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            document.querySelector('#modal-title').textContent = 'Добавить товар';
            document.querySelector('#product-id').value = '';
            document.querySelector('#product-form').reset();
            modal.style.display = 'block';
        });
    }
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Обработка формы товара
    const productForm = document.querySelector('#product-form');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = this.querySelector('#product-id').value;
            const name = this.querySelector('#product-name').value;
            const category = this.querySelector('#product-category').value;
            const price = parseInt(this.querySelector('#product-price').value);
            const description = this.querySelector('#product-description').value;
            const image = this.querySelector('#product-image').value;
            
            let products = JSON.parse(localStorage.getItem('products')) || [];
            
            if (id) {
                // Редактирование существующего товара
                const index = products.findIndex(p => p.id == id);
                if (index !== -1) {
                    products[index] = {
                        ...products[index],
                        name,
                        category,
                        price,
                        description,
                        image
                    };
                }
            } else {
                // Добавление нового товара
                const newProduct = {
                    id: Date.now(),
                    name,
                    category,
                    price,
                    description,
                    image
                };
                products.push(newProduct);
            }
            
            localStorage.setItem('products', JSON.stringify(products));
            modal.style.display = 'none';
            loadAdminProducts();
        });
    }
    
    // Загружаем товары при загрузке страницы
    loadAdminProducts();
});

// Загрузка товаров для админки
function loadAdminProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const container = document.querySelector('#admin-products');
    
    if (products.length === 0) {
        container.innerHTML = '<p>Товары не найдены</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <img src="${product.image}" alt="${product.name}" style="width:100%; height:200px; object-fit:cover;">
            <h3>${product.name}</h3>
            <p>Категория: ${getCategoryName(product.category)}</p>
            <p>Цена: ${product.price} руб.</p>
            <div class="admin-product-actions">
                <button class="btn edit-btn" data-id="${product.id}">Редактировать</button>
                <button class="btn delete-btn" data-id="${product.id}">Удалить</button>
            </div>
        </div>
    `).join('');
    
    // Обработчики кнопок редактирования
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            editProduct(productId);
        });
    });
    
    // Обработчики кнопок удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.dataset.id;
            if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                deleteProduct(productId);
            }
        });
    });
}

// Редактирование товара
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) return;
    
    const modal = document.querySelector('#product-modal');
    document.querySelector('#modal-title').textContent = 'Редактировать товар';
    document.querySelector('#product-id').value = product.id;
    document.querySelector('#product-name').value = product.name;
    document.querySelector('#product-category').value = product.category;
    document.querySelector('#product-price').value = product.price;
    document.querySelector('#product-description').value = product.description;
    document.querySelector('#product-image').value = product.image;
    
    modal.style.display = 'block';
}

// Удаление товара
function deleteProduct(productId) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id != productId);
    
    localStorage.setItem('products', JSON.stringify(products));
    loadAdminProducts();
}

// Загрузка заказов для админки
function loadAdminOrders() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const allOrders = [];
    
    users.forEach(user => {
        if (user.orders && user.orders.length > 0) {
            user.orders.forEach(order => {
                allOrders.push({
                    ...order,
                    userName: user.name,
                    userEmail: user.email
                });
            });
        }
    });
    
    const container = document.querySelector('#admin-orders');
    
    if (allOrders.length === 0) {
        container.innerHTML = '<p>Заказы не найдены</p>';
        return;
    }
    
    // Сортируем заказы по дате (новые сначала)
    allOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = allOrders.map(order => `
        <div class="admin-order">
            <div class="order-header">
                <span class="order-id">Заказ #${order.id}</span>
                <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
            </div>
            <div class="customer-info">
                <p>Клиент: ${order.userName} (${order.userEmail})</p>
                <p>Телефон: ${order.phone}</p>
                <p>Адрес: ${order.address}</p>
                ${order.comment ? `<p>Комментарий: ${order.comment}</p>` : ''}
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
            <div class="order-actions">
                ${order.status !== 'completed' ? `
                    <button class="btn complete-order" data-id="${order.id}">Завершить заказ</button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Обработчики кнопок завершения заказа
    document.querySelectorAll('.complete-order').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderId = this.dataset.id;
            completeOrder(orderId);
        });
    });
}

// Завершение заказа
function completeOrder(orderId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let orderUpdated = false;
    
    users.forEach(user => {
        if (user.orders && user.orders.length > 0) {
            const orderIndex = user.orders.findIndex(o => o.id == orderId);
            if (orderIndex !== -1) {
                user.orders[orderIndex].status = 'completed';
                orderUpdated = true;
            }
        }
    });
    
    if (orderUpdated) {
        localStorage.setItem('users', JSON.stringify(users));
        
        // Обновляем текущего пользователя, если он есть
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
            const updatedUser = users.find(u => u.id === currentUser.id);
            if (updatedUser) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        }
        
        loadAdminOrders();
    }
}

// Загрузка пользователей для админки
function loadAdminUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const container = document.querySelector('#admin-users');
    
    if (users.length === 0) {
        container.innerHTML = '<p>Пользователи не найдены</p>';
        return;
    }
    
    container.innerHTML = users.map(user => `
        <div class="admin-user">
            <h3>${user.name} ${user.isAdmin ? '(Администратор)' : ''}</h3>
            <p>Email: ${user.email}</p>
            <p>Телефон: ${user.phone}</p>
            <p>Заказов: ${user.orders ? user.orders.length : 0}</p>
        </div>
    `).join('');
}

// Получение названия категории
function getCategoryName(category) {
    const categories = {
        'roses': 'Розы',
        'tulips': 'Тюльпаны',
        'lilies': 'Лилии',
        'mixed': 'Смешанные букеты'
    };
    
    return categories[category] || category;
}