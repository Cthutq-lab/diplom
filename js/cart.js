let clearCartBtn = null;
// Корзина
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('#cart-items')) {
        loadCart();
    }
});
function clearCart() {
    if (confirm('Вы уверены, что хотите полностью очистить корзину?')) {
        localStorage.removeItem('cart');
        appliedPromo = null;
        
        // Обновляем отображение
        const cartItems = document.querySelector('#cart-items');
        cartItems.innerHTML = '<p class="empty-cart">Ваша корзина пуста</p>';
        
        document.querySelector('#total-items').textContent = '0';
        document.querySelector('#subtotal-price').textContent = '0';
        document.querySelector('#discount').textContent = '0';
        document.querySelector('#total-price').textContent = '0';
        
        // Скрываем кнопку очистки
        if (clearCartBtn) {
            clearCartBtn.style.display = 'none';
        }
        
        // Обновляем счетчик в шапке
        updateCartCount();
    }
}
// Загрузка корзины
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItems = document.querySelector('#cart-items');
    const totalItems = document.querySelector('#total-items');
    const totalPrice = document.querySelector('#total-price');
    
    // Инициализация кнопки очистки корзины
    clearCartBtn = document.querySelector('#clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
        // Скрываем кнопку, если корзина пуста
        clearCartBtn.style.display = cart.length === 0 ? 'none' : 'inline-block';
    }
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Ваша корзина пуста</p>';
        totalItems.textContent = '0';
        totalPrice.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price} руб. x ${item.quantity} = ${item.price * item.quantity} руб.</div>
            </div>
            <div class="cart-item-actions">
                <input type="number" value="${item.quantity}" min="1" class="item-quantity">
                <button class="remove-item">Удалить</button>
            </div>
        </div>
    `).join('');
    
    // Обновляем итоги
    updateCartTotals(cart);
    
    // Обработчики изменения количества
    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.closest('.cart-item').dataset.id;
            const newQuantity = parseInt(this.value);
            
            updateCartItemQuantity(itemId, newQuantity);
        });
    });
    
    // Обработчики удаления
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.closest('.cart-item').dataset.id;
            removeFromCart(itemId);
        });
    });
    
    // Оформление заказа
    const checkoutForm = document.querySelector('#checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user) {
                alert('Пожалуйста, войдите в систему для оформления заказа!');
                window.location.href = 'login.html';
                return;
            }
            
            const name = this.querySelector('#name').value;
            const phone = this.querySelector('#phone').value;
            const email = this.querySelector('#email').value;
            const address = this.querySelector('#address').value;
            const comment = this.querySelector('#comment').value;
            
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (cart.length === 0) {
                alert('Ваша корзина пуста!');
                return;
            }
            
            const order = {
                id: Date.now(),
                date: new Date().toISOString(),
                status: 'pending',
                name,
                phone,
                email,
                address,
                comment,
                items: [...cart]
            };
            
            // Добавляем заказ в историю пользователя
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === user.id);
            
            if (userIndex !== -1) {
                if (!users[userIndex].orders) {
                    users[userIndex].orders = [];
                }
                users[userIndex].orders.push(order);
                localStorage.setItem('users', JSON.stringify(users));
                
                // Обновляем текущего пользователя
                user.orders = users[userIndex].orders;
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            // Очищаем корзину
            localStorage.removeItem('cart');
            updateCartCount();
            
            alert(`Заказ #${order.id} успешно оформлен! Спасибо за покупку!`);
            window.location.href = 'profile.html';
        });
        
        // Заполняем данные пользователя, если он авторизован
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            checkoutForm.querySelector('#name').value = user.name;
            checkoutForm.querySelector('#phone').value = user.phone;
            checkoutForm.querySelector('#email').value = user.email;
        }
    }
}

// Обновление итогов корзины
function updateCartTotals(cart) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    document.querySelector('#total-items').textContent = totalItems;
    document.querySelector('#total-price').textContent = totalPrice;
}

// Обновление количества товара в корзине
function updateCartItemQuantity(itemId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id == itemId);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartTotals(cart);
    }
}

// Удаление товара из корзины
function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id != itemId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
    updateCartCount();
}
// Обработка выбора способа оплаты
document.addEventListener('DOMContentLoaded', function() {
  const paymentOptions = document.querySelectorAll('input[name="payment"]');
  const cardDetails = document.getElementById('card-details');
  
  paymentOptions.forEach(option => {
    option.addEventListener('change', function() {
      if (this.value === 'card') {
        cardDetails.style.display = 'block';
      } else {
        cardDetails.style.display = 'none';
      }
    });
  });
  
  // Маска для ввода номера карты
  if (document.getElementById('card-number')) {
    new Inputmask('9999 9999 9999 9999').mask(document.getElementById('card-number'));
    new Inputmask('99/99').mask(document.getElementById('card-expiry'));
    new Inputmask('999').mask(document.getElementById('card-cvc'));
  }
  
  // Обработка формы оформления заказа
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
      const orderData = {
        payment: paymentMethod,
        // другие данные заказа...
      };
      
      if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvc = document.getElementById('card-cvc').value;
        
        if (!validateCard(cardNumber, cardExpiry, cardCvc)) {
          alert('Пожалуйста, проверьте данные карты');
          return;
        }
        
        orderData.card = {
          number: cardNumber,
          expiry: cardExpiry,
          cvc: cardCvc
        };
      }
      
      processOrder(orderData);
    });
  }
});

function validateCard(number, expiry, cvc) {
  // Простая валидация (в реальном проекте используйте библиотеку)
  return number.length === 16 && 
         /^\d{2}\/\d{2}$/.test(expiry) && 
         cvc.length === 3;
}

function processOrder(orderData) {
  // Здесь будет логика обработки заказа
  console.log('Оформление заказа:', orderData);
  alert('Заказ успешно оформлен!');
}