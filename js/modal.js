// Инициализация модального окна
function initModal() {
  const modal = {
    overlay: document.getElementById('modal-overlay'),
    title: document.getElementById('modal-title'),
    body: document.getElementById('modal-body'),
    confirmBtn: document.getElementById('modal-confirm'),
    closeBtn: document.querySelector('.modal-close'),
    
    show: function(title, message, callback) {
      this.title.textContent = title;
      this.body.innerHTML = message;
      this.overlay.classList.add('active');
      
      // Обработчики закрытия
      const closeModal = () => {
        this.overlay.classList.remove('active');
        if (callback) callback();
      };
      
      this.confirmBtn.onclick = closeModal;
      this.closeBtn.onclick = closeModal;
      this.overlay.onclick = (e) => {
        if (e.target === this.overlay) closeModal();
      };
    }
  };
  
  // Добавляем в глобальную область видимости
  window.showModal = modal.show.bind(modal);
}

// Заменяем стандартные alert
function replaceAlerts() {
  window.originalAlert = window.alert;
  window.alert = (message, title = 'Уведомление') => {
    showModal(title, message);
    return true;
  };
}

document.addEventListener('DOMContentLoaded', function() {
  initModal();
  replaceAlerts();
});