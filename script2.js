const cartCatalog = document.getElementById('cart-catalog');
const emptyCartMessage = document.getElementById('empty-cart-message');

function calculateShippingCost() {
    const deliveryDate = document.querySelector('input[name="delivery-date"]').value;
    const deliveryTime = document.querySelector('select[name="delivery-time"]').value;
    const today = new Date();
    const selectedDate = new Date(deliveryDate);
    
    let shippingCost = 200; // Базовая стоимость доставки

    // Проверка, является ли выбранный день выходным
    const isWeekend = selectedDate.getDay() === 6 || selectedDate.getDay() === 0; // Суббота (6) или Воскресенье (0)

    // Проверка, если день выбран в вечернее время
    const isEvening = deliveryTime === 'evening';

    // Добавляем стоимость в зависимости от времени суток или выходного дня
    if (isEvening) {
        shippingCost += 200; // Вечернее время в будние дни
    } if (isWeekend) {
        shippingCost += 300; // Выходные дни
    }

    return shippingCost;
}

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartCatalog.innerHTML = '';
        document.getElementById('total-price').innerText = '0 руб.'; // Обновляем итоговую стоимость
    } else {
        emptyCartMessage.style.display = 'none';
        cartCatalog.innerHTML = '';
        let totalPrice = 0; // Переменная для расчета итоговой стоимости
        cart.forEach((item, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML =  
                `<img src="${item.image}" alt="${item.name}">
                    <h2>${item.name}</h2>
                    <p>Рейтинг: ${item.rating}</p>
                    <p>Цена: ${item.discount ? `<s>${item.price * 1.2} руб.</s> ${item.price} руб.` : `${item.price} руб.`}</p>
                    <button class="remove-from-cart" data-index="${index}">Удалить</button>`;
            cartCatalog.appendChild(productCard);
            totalPrice += item.price; // Добавляем цену товара к общей стоимости
        });

        // Рассчитываем стоимость доставки
        const shippingCost = calculateShippingCost();
        totalPrice += shippingCost; // Прибавляем к общей стоимости

        // Обновляем итоговую стоимость
        document.getElementById('total-price').innerText = `${totalPrice} руб. (Доставка: ${shippingCost} руб.)`;

        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = parseInt(event.target.dataset.index);
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCart(); // Перерисовываем корзину после удаления
            });
        });
    }
}

// Слушаем изменения в поле даты и времени
document.querySelector('input[name="delivery-date"]').addEventListener('change', renderCart);
document.querySelector('select[name="delivery-time"]').addEventListener('change', renderCart);

renderCart(); // Перерисовываем корзину при загрузке страницы

document.getElementById('checkout-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Собираем данные о пользователе
    const userData = {
        name: this['name'].value,
        email: this['email'].value,
        phone: this['phone'].value,
        address: this['address'].value,
        newsletter: this['newsletter'].checked,
    };

    const order = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: cart.map(item => item.name).join(', '),
        total: cart.reduce((sum, item) => sum + item.price, 0) + ' руб.',
        delivery: `${this['delivery-date'].value} ${this['delivery-time'].options[this['delivery-time'].selectedIndex].text}`,
        comment: this['comment'].value,  // Добавляем комментарий
        user: userData
    };

    // Сохраняем заказ в localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Очистить корзину
    localStorage.setItem('cart', JSON.stringify([]));

    // Показываем уведомление
    const notification = document.getElementById('notification');
    notification.style.display = 'block';

    // Закрытие уведомления по клику на крестик
    document.getElementById('close-notification').addEventListener('click', () => {
        notification.style.display = 'none';
    });
    renderCart();
});

document.getElementById('reset-cart').addEventListener('click', function() {
    // Очистка корзины в localStorage
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Очистка формы
    document.getElementById('checkout-form').reset();
    
    // Обновление интерфейса (перерисовываем корзину)
    renderCart();
});