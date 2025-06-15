let currentRating = 0;
// Основные функции для всех страниц
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация корзины
    updateCartCount();
    
    // Проверка авторизации
    checkAuth();
    initReviewsPreview();
    
    // Обработка формы обратной связи
    const feedbackForms = document.querySelectorAll('#feedback-form');
    feedbackForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Здесь можно добавить отправку данных на сервер
            // Для примера просто выводим в консоль
            console.log('Форма обратной связи отправлена:', {
                name,
                email,
                message
            });
            
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            this.reset();
        });
    });
    
    // Инициализация страницы продукта
    if (document.querySelector('#product-container')) {
        loadProduct();
    }
    
    // Инициализация каталога
    if (document.querySelector('#catalog-products')) {
        loadCatalog();
    }
    
    // Инициализация главной страницы
    if (document.querySelector('#featured-products')) {
        loadFeaturedProducts();
    }
});

// Обновление счетчика корзины
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countElements = document.querySelectorAll('#cart-count');
    
    countElements.forEach(el => {
        el.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    });
}

// Проверка авторизации
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authLinks = document.querySelectorAll('#auth-links');
    const adminLinks = document.querySelectorAll('.admin-link');
    
    if (user) {
        authLinks.forEach(container => {
            container.querySelector('.login-link').classList.add('hidden');
            container.querySelector('.register-link').classList.add('hidden');
            container.querySelector('.profile-link').classList.remove('hidden');
            container.querySelector('.logout-link').classList.remove('hidden');
        });
        
        // Показываем админку только для админов
        if (user.isAdmin) {
            adminLinks.forEach(link => link.classList.remove('hidden'));
        }
    } else {
        authLinks.forEach(container => {
            container.querySelector('.login-link').classList.remove('hidden');
            container.querySelector('.register-link').classList.remove('hidden');
            container.querySelector('.profile-link').classList.add('hidden');
            container.querySelector('.logout-link').classList.add('hidden');
        });
        
        adminLinks.forEach(link => link.classList.add('hidden'));
    }
}

// Загрузка продукта
function loadProduct() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        window.location.href = 'catalog.html';
        return;
    }
    
    const container = document.querySelector('#product-container');
    container.innerHTML = `
        <div class="product-gallery">
            <img src="${product.image}" alt="${product.name}" class="product-main-image">
        </div>
        <div class="product-content">
            <h1>${product.name}</h1>
            <div class="product-price">${product.price} руб.</div>
            <div class="product-description">${product.description}</div>
            <div class="product-actions">
                <div class="quantity-selector">
                    <button class="decrease">-</button>
                    <input type="number" value="1" min="1" class="quantity">
                    <button class="increase">+</button>
                </div>
                <button class="btn add-to-cart" data-id="${product.id}">Добавить в корзину</button>
            </div>
        </div>
    `;
    
    // Обработчики для кнопок количества
    container.querySelector('.decrease').addEventListener('click', function() {
        const input = container.querySelector('.quantity');
        if (input.value > 1) input.value--;
    });
    
    container.querySelector('.increase').addEventListener('click', function() {
        const input = container.querySelector('.quantity');
        input.value++;
    });
    
    // Обработчик добавления в корзину
    container.querySelector('.add-to-cart').addEventListener('click', function() {
        const quantity = parseInt(container.querySelector('.quantity').value);
        addToCart(product.id, quantity);
    });
}

// Загрузка каталога
function loadCatalog() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const container = document.querySelector('#catalog-products');
    
    if (products.length === 0) {
        container.innerHTML = '<p>Товары не найдены</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price} руб.</div>
                <a href="product.html?id=${product.id}" class="btn">Подробнее</a>
            </div>
        </div>
    `).join('');
    
    // Фильтрация
    const categoryFilter = document.querySelector('#category-filter');
    const priceFilter = document.querySelector('#price-filter');
    
    function applyFilters() {
        const category = categoryFilter.value;
        const priceRange = priceFilter.value;
        
        const filtered = products.filter(product => {
            // Фильтр по категории
            if (category !== 'all' && product.category !== category) return false;
            
            // Фильтр по цене
            if (priceRange !== 'all') {
                const [min, max] = priceRange.split('-').map(Number);
                if (priceRange.endsWith('+')) {
                    if (product.price < min) return false;
                } else {
                    if (product.price < min || product.price > max) return false;
                }
            }
            
            return true;
        });
        
        if (filtered.length === 0) {
            container.innerHTML = '<p>Товары не найдены</p>';
        } else {
            container.innerHTML = filtered.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${product.price} руб.</div>
                        <a href="product.html?id=${product.id}" class="btn">Подробнее</a>
                    </div>
                </div>
            `).join('');
        }
    }
    
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
}

// Загрузка популярных товаров
function loadFeaturedProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const featured = products.slice(0, 4); // Берем первые 4 как популярные
    
    const container = document.querySelector('#featured-products');
    
    if (featured.length === 0) {
        container.innerHTML = '<p>Товары не найдены</p>';
        return;
    }
    
    container.innerHTML = featured.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price} руб.</div>
                <a href="product.html?id=${product.id}" class="btn">Подробнее</a>
            </div>
        </div>
    `).join('');
}

// Добавление в корзину
function addToCart(productId, quantity = 1) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    alert(`Товар "${product.name}" добавлен в корзину!`);
}
// Добавить в script.js
function initSearch() {
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
}

function performSearch() {
    const query = document.querySelector('#search-input').value.trim().toLowerCase();
    if (!query) return;
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.description.toLowerCase().includes(query)
    );
    
    if (document.querySelector('#catalog-products')) {
        // Если мы на странице каталога
        const container = document.querySelector('#catalog-products');
        
        if (filtered.length === 0) {
            container.innerHTML = '<p>По вашему запросу ничего не найдено</p>';
        } else {
            container.innerHTML = filtered.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">${product.price} руб.</div>
                        <a href="product.html?id=${product.id}" class="btn">Подробнее</a>
                    </div>
                </div>
            `).join('');
        }
    } else {
        // Если мы не на странице каталога, перенаправляем туда с параметром поиска
        localStorage.setItem('searchQuery', query);
        window.location.href = 'catalog.html';
    }
}

// В DOMContentLoaded добавить:
initSearch();

// Проверить сохраненный запрос при загрузке каталога
if (document.querySelector('#catalog-products')) {
    const savedQuery = localStorage.getItem('searchQuery');
    if (savedQuery) {
        document.querySelector('#search-input').value = savedQuery;
        performSearch();
        localStorage.removeItem('searchQuery');
    }
}
initReviews();
initReviewForm();

// Добавим новые функции
function initReviews() {
    // Загружаем отзывы из localStorage или создаем демо-отзывы
    if (!localStorage.getItem('reviews')) {
        const demoReviews = [
            {
                id: 1,
                name: 'Анна',
                text: 'Заказывала букет для мамы на юбилей. Цветы были свежие, доставка вовремя. Мама в восторге!',
                rating: 5,
                date: '2023-05-15'
            },
            {
                id: 2,
                name: 'Иван',
                text: 'Хороший сервис, но букет пришел немного меньше, чем я ожидал. В целом качеством доволен.',
                rating: 4,
                date: '2023-06-02'
            },
            {
                id: 3,
                name: 'Елена',
                text: 'Самые красивые розы в городе! Заказываю уже третий раз, всегда на высоте.',
                rating: 5,
                date: '2023-06-10'
            }
        ];
        localStorage.setItem('reviews', JSON.stringify(demoReviews));
    }
    
    // Отображаем отзывы
    displayReviews();
}

function displayReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const container = document.querySelector('#reviews-grid');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p>Пока нет отзывов. Будьте первым!</p>';
        return;
    }
    
    // Сортируем по дате (новые сначала)
    reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">${review.name}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div class="review-text">${review.text}</div>
        </div>
    `).join('');
}

function initReviewForm() {
    const form = document.querySelector('#review-form');
    if (!form) return;
    
    // Инициализация звезд рейтинга
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.value);
            updateStars();
        });
    });
    
    // Обработка формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = this.querySelector('#review-name').value.trim();
        const text = this.querySelector('#review-text').value.trim();
        
        if (!name || !text || currentRating === 0) {
            alert('Пожалуйста, заполните все поля и поставьте оценку');
            return;
        }
        
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const newReview = {
            id: Date.now(),
            name,
            text,
            rating: currentRating,
            date: new Date().toISOString()
        };
        
        reviews.unshift(newReview); // Добавляем в начало массива
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        // Очищаем форму
        this.reset();
        currentRating = 0;
        updateStars();
        
        // Обновляем отображение отзывов
        displayReviews();
        
        alert('Спасибо за ваш отзыв!');
    });
}

function updateStars() {
    document.querySelectorAll('.star').forEach(star => {
        const value = parseInt(star.dataset.value);
        star.classList.toggle('active', value <= currentRating);
    });
}
function initReviewsPreview() {
    if (!document.querySelector('#preview-reviews-grid')) return;
    
    // Создаем демо-отзывы при первом посещении
    if (!localStorage.getItem('reviews')) {
        const demoReviews = [
            {
                id: 1,
                name: 'Анна',
                text: 'Очень красивые цветы! Доставка быстрая, букет свежий. Обязательно закажу еще!',
                rating: 5,
                date: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Иван',
                text: 'Заказал цветы для мамы, остался доволен. Спасибо за качественный сервис!',
                rating: 4,
                date: new Date(Date.now() - 86400000).toISOString() // Вчера
            },
            {
                id: 3,
                name: 'Елена',
                text: 'Букет соответствовал описанию, доставили вовремя. Рекомендую!',
                rating: 5,
                date: new Date(Date.now() - 172800000).toISOString() // Позавчера
            }
        ];
        localStorage.setItem('reviews', JSON.stringify(demoReviews));
    }
    
    displayPreviewReviews();
}

function displayPreviewReviews() {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const container = document.querySelector('#preview-reviews-grid');
    
    // Сортируем по дате (новые сначала) и берем 3 последних
    const latestReviews = [...reviews]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
    
    container.innerHTML = latestReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">${review.name}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div class="review-text">${review.text}</div>
        </div>
    `).join('');
    
    // Скрываем кнопку, если отзывов меньше 3
    if (reviews.length <= 3) {
        document.querySelector('.reviews-actions').style.display = 'none';
    }
}
