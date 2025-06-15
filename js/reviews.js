// Настройки пагинации
const reviewsPerPage = 10;
let currentReviewsPage = 1;
let currentSortMethod = 'date-desc';

// Инициализация страницы отзывов
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#reviews-grid')) {
        initReviewsPage();
    }
    
    if (document.querySelector('#preview-reviews-grid')) {
        initReviewsPreview();
    }
});

function initReviewsPage() {
    // Проверка авторизации для формы отзыва
    const user = JSON.parse(localStorage.getItem('user'));
    const addReviewContainer = document.querySelector('#add-review-container');
    const loginPrompt = document.querySelector('#login-prompt');
    
    if (user) {
        addReviewContainer.style.display = 'block';
        loginPrompt.style.display = 'none';
        initReviewForm();
    } else {
        addReviewContainer.style.display = 'none';
        loginPrompt.style.display = 'block';
    }
    
    // Инициализация сортировки
    document.querySelector('#reviews-sort').addEventListener('change', function() {
        currentSortMethod = this.value;
        currentReviewsPage = 1;
        displayAllReviews();
    });
    
    displayAllReviews();
}

function initReviewsPreview() {
    document.querySelector('#preview-sort').addEventListener('change', function() {
        displayPreviewReviews();
    });
    
    displayPreviewReviews();
}

// Отображение 3 отзывов на главной
function displayPreviewReviews() {
    const sortMethod = document.querySelector('#preview-sort').value;
    const reviews = getSortedReviews(sortMethod).slice(0, 3);
    const container = document.querySelector('#preview-reviews-grid');
    
    container.innerHTML = reviews.length > 0 
        ? reviews.map(review => createReviewElement(review)).join('')
        : '<p>Пока нет отзывов</p>';
}

// Отображение всех отзывов с пагинацией
function displayAllReviews() {
    const reviews = getSortedReviews(currentSortMethod);
    const startIdx = (currentReviewsPage - 1) * reviewsPerPage;
    const paginatedReviews = reviews.slice(startIdx, startIdx + reviewsPerPage);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);
    
    const container = document.querySelector('#reviews-grid');
    const pagination = document.querySelector('#reviews-pagination');
    
    container.innerHTML = paginatedReviews.length > 0
        ? paginatedReviews.map(review => createReviewElement(review)).join('')
        : '<p>Пока нет отзывов</p>';
    
    // Пагинация
    pagination.innerHTML = '';
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = i === currentReviewsPage ? 'active' : '';
            btn.addEventListener('click', () => {
                currentReviewsPage = i;
                displayAllReviews();
            });
            pagination.appendChild(btn);
        }
    }
}

// Общие функции
function getSortedReviews(method) {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
    return [...reviews].sort((a, b) => {
        switch(method) {
            case 'date-asc': return new Date(a.date) - new Date(b.date);
            case 'rating-desc': return b.rating - a.rating;
            case 'rating-asc': return a.rating - b.rating;
            default: return new Date(b.date) - new Date(a.date);
        }
    });
}

function createReviewElement(review) {
    return `
        <div class="review-card">
            <div class="review-header">
                <span class="review-author">${review.name}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <div class="review-text">${review.text}</div>
        </div>
    `;
}

function initReviewForm() {
    const form = document.querySelector('#review-form');
    if (!form) return;
    
    let currentRating = 0;
    
    // Инициализация звезд рейтинга
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            currentRating = parseInt(this.dataset.value);
            updateStars();
        });
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const text = this.querySelector('#review-text').value.trim();
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!text || currentRating === 0) {
            alert('Пожалуйста, заполните все поля');
            return;
        }
        
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        const newReview = {
            id: Date.now(),
            name: user.name,
            text,
            rating: currentRating,
            date: new Date().toISOString()
        };
        
        reviews.unshift(newReview);
        localStorage.setItem('reviews', JSON.stringify(reviews));
        
        this.reset();
        currentRating = 0;
        updateStars();
        
        // Обновляем отображение
        if (document.querySelector('#reviews-grid')) {
            currentReviewsPage = 1;
            displayAllReviews();
        }
        if (document.querySelector('#preview-reviews-grid')) {
            displayPreviewReviews();
        }
        
        alert('Спасибо за ваш отзыв!');
    });
    
    function updateStars() {
        document.querySelectorAll('.star').forEach(star => {
            const value = parseInt(star.dataset.value);
            star.classList.toggle('active', value <= currentRating);
        });
    }
}