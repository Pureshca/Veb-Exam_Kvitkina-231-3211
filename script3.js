function calculateDeliveryCost(deliveryDate, deliveryTime) {
    // Преобразуем строку "ДД.ММ.ГГГГ" в объект Date
    const [day, month, year] = deliveryDate.split('.');
    const formattedDate = new Date(`${year}-${month}-${day}`);
    const deliveryDay = formattedDate.getDay(); // Получаем день недели из даты доставки (0 - воскресенье, 1 - понедельник и т.д.)

    let deliveryCost = 200; // Базовая стоимость доставки
    
    // Если это выходной день
    if (deliveryDay === 6 || deliveryDay === 0) {
        deliveryCost += 300; // Добавляем 300 за выходной день
    }

    console.log(deliveryTime); // Для отладки вывода даты
    // Если доставка вечером в будний день
    if (deliveryTime === 'Вечер') {
        deliveryCost += 200; // Добавляем 200 за вечернюю доставку
        console.log(deliveryTime); // Для отладки вывода даты
    }

    return deliveryCost;
}




    function renderOrders() {
        const ordersList = document.getElementById('orders-list');
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        console.log('Orders:', orders); // Логируем содержимое orders
        ordersList.innerHTML = '';

        if (orders.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6">Нет заказов</td>`;
            ordersList.appendChild(row);
            return;
        }

        // Сортировка заказов по дате (от новых к старым)
        orders.sort((a, b) => {
            const dateA = convertDate(a.date);
            const dateB = convertDate(b.date);
            return dateB - dateA;
        });

        orders.forEach((order, index) => {
            // Получаем стоимость доставки
            const [deliveryDate, deliveryTime] = order.delivery.split(' '); // Разделяем дату и время
            const deliveryCost = calculateDeliveryCost(deliveryDate, deliveryTime); // Передаем оба параметра
            const totalCost = parseFloat(order.total);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.date}</td>
                <td>${order.items}</td>
                <td>${totalCost + deliveryCost} руб.</td> <!-- Обновленная стоимость -->
                <td>${order.delivery}</td> <!-- Показ стоимости доставки -->
                <td>
                    <button onclick="openModal('view-modal', ${order.id})">Просмотр</button>
                    <button onclick="openModal('edit-modal', ${order.id})">Редактирование</button>
                    <button onclick="openModal('delete-modal', ${order.id})">Удаление</button>
                </td>
            `;
            console.log(totalCost);
            ordersList.appendChild(row);
        });
    }

    // Функция для конвертации даты из формата "14.01.2025, 09:22:19" в объект Date
    function convertDate(dateString) {
        const [datePart, timePart] = dateString.split(', ');
        const [day, month, year] = datePart.split('.');
        return new Date(`${year}-${month}-${day}T${timePart}`);
    }



    function openModal(modalId, orderId) {
    // Открываем соответствующее модальное окно
    document.getElementById(modalId).style.display = 'flex';

    // Получаем список заказов из localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    // Находим заказ по его ID
    const order = orders.find(order => order.id === orderId);

    if (modalId === 'view-modal') {
        const [deliveryDate, deliveryTime] = order.delivery.split(' '); // Разделяем дату и время
            const deliveryCost = calculateDeliveryCost(deliveryDate, deliveryTime); // Передаем оба параметра
        // В модальном окне "Просмотр" показываем информацию о заказе
        document.getElementById('view-content').innerText = `Заказ #${order.id}: 
                Время заказа: ${order.date}
                Товары: ${order.items}
                Стоимость: ${order.total} + ${deliveryCost} руб.
                Доставка: ${order.delivery}
                Комментарий: ${order.comment}`;

        // Также показываем информацию о пользователе
        document.getElementById('view-user').innerText = `Имя: ${order.user.name}
                Email: ${order.user.email}
                Телефон: ${order.user.phone}
                Адрес доставки: ${order.user.address}`;
    }

    if (modalId === 'edit-modal') {
        const form = document.getElementById('edit-form');
        form['name'].value = order.user.name;
        form['email'].value = order.user.email;
        form['phone'].value = order.user.phone;
        form['address'].value = order.user.address;
        form['comment'].value = order.comment;

        // Разделяем доставку на дату и временной интервал
        const [deliveryDate, deliveryTime] = order.delivery.split(' ');
        form['delivery-date'].value = deliveryDate;

        // Устанавливаем значение временного интервала
        const timeOption = Array.from(form['delivery-time'].options).find(option => option.text === deliveryTime);
        if (timeOption) {
            form['delivery-time'].value = timeOption.value;
        }

        form.onsubmit = function (e) {
            e.preventDefault();

            // Обновляем данные заказа
            order.user.name = form['name'].value;
            order.user.email = form['email'].value;
            order.user.phone = form['phone'].value;
            order.user.address = form['address'].value;
            order.comment = form['comment'].value;

            // Сохраняем дату и временной интервал доставки
            const updatedDeliveryDate = form['delivery-date'].value;
            const updatedDeliveryTime = form['delivery-time'].options[form['delivery-time'].selectedIndex].text;
            order.delivery = `${updatedDeliveryDate} ${updatedDeliveryTime}`;

            // Обновляем localStorage
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const updatedOrders = orders.map(existingOrder =>
                existingOrder.id === order.id ? order : existingOrder
            );
            localStorage.setItem('orders', JSON.stringify(updatedOrders));

            closeModal(modalId);
            renderOrders();

            // Показываем уведомление об успешном редактировании
            const notification = document.getElementById('notification');
            notification.style.display = 'block';

            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        };
    }



    if (modalId === 'delete-modal') {
        // В модальном окне "Удаление" присваиваем функцию для удаления заказа
        document.querySelector("#delete-modal button:last-child").onclick = function() {
            confirmDelete(order.id);
        };
    }
}

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    function confirmDelete(orderId) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.filter(order => order.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        closeModal('delete-modal');
    }

    renderOrders();