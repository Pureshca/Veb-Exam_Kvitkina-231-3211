const catalog = document.getElementById('catalog');
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.createElement('div');
suggestionsBox.className = 'suggestions-box';
searchInput.parentNode.appendChild(suggestionsBox);

let products = []; // Список всех товаров
let currentPage = 1; // Текущая страница
const productsPerPage = 10; // Количество товаров на странице
let filteredProducts = []; // Фильтрованные товары
let isLoaded = false; // Флаг для отслеживания состояния загрузки товаров


// Функция для получения товаров с API
async function fetchProducts() {
    try {
        const response = await fetch('https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=cb10a308-4f2b-4f17-8eaa-3df2eca01333');
        const data = await response.json();
        products = data;
        filteredProducts = products; // Изначально все товары не отфильтрованы
        isLoaded = true; // Устанавливаем флаг в true, когда товары загружены
        renderProducts(); // Отобразить товары

        // Устанавливаем сортировку по популярности после загрузки товаров
        sortProducts('popularity');
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Функция для отображения товаров на текущей странице
function renderProducts() {
    const start = (currentPage - 1) * productsPerPage;
    const end = currentPage * productsPerPage;
    const pageProducts = filteredProducts.slice(start, end); // Товары на текущей странице

    // Добавляем товары, а не заменяем их
    pageProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image_url}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>Рейтинг: ${product.rating}</p>
            <p class="price">Цена: ${product.discount_price ? `<s class="original-price">${product.actual_price} руб.</s> <span class="discounted-price">${product.discount_price} руб.</span>` : `${product.actual_price} руб.`}</p>
            <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
        `;
        catalog.appendChild(productCard);
    });

    // Добавляем обработчик событий для кнопок "Добавить в корзину"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            const product = products.find(p => p.id == productId);
            addToCart(product);  // Функция добавления товара в корзину
        });
    });

    // Если товаров осталось меньше, чем 10, скрыть кнопку "Загрузить ещё"
    if (end >= filteredProducts.length) {
        document.getElementById('load-more').style.display = 'none';
    } else {
        document.getElementById('load-more').style.display = 'block';
    }
}


// Обработчик для кнопки "Загрузить ещё"
document.getElementById('load-more').addEventListener('click', () => {
    currentPage++;
    renderProducts();
});

// Функция фильтрации
function applyFilters() {
    const formData = new FormData(document.getElementById('filter-form'));
    const filters = {
        categories: formData.getAll('category'),
        priceMin: formData.get('priceMin'),
        priceMax: formData.get('priceMax'),
        discount: formData.has('discount')
    };

    filteredProducts = products;

    if (filters.categories.length) {
        filteredProducts = filteredProducts.filter(product => filters.categories.includes(product.main_category));
    }

    if (filters.priceMin) {
        filteredProducts = filteredProducts.filter(product => product.actual_price >= filters.priceMin);
    }

    if (filters.priceMax) {
        filteredProducts = filteredProducts.filter(product => product.actual_price <= filters.priceMax);
    }

    if (filters.discount) {
        filteredProducts = filteredProducts.filter(product => product.discount_price && product.discount_price < product.actual_price);
    }

    currentPage = 1; // Сбросить на первую страницу
    catalog.innerHTML = ''; // Очистить каталог перед рендерингом
    renderProducts();
}

// Функция сортировки
function sortProducts(order) {
    let sortedProducts = [...filteredProducts];

    if (order === 'price-asc') {
        sortedProducts.sort((a, b) => a.actual_price - b.actual_price);
    } else if (order === 'price-desc') {
        sortedProducts.sort((a, b) => b.actual_price - a.actual_price);
    } else if (order === 'popularity') {
        sortedProducts.sort((a, b) => b.rating - a.rating);
    }

    filteredProducts = sortedProducts; // Применяем сортировку
    currentPage = 1; // Сбросить на первую страницу
    catalog.innerHTML = ''; // Очистить каталог перед рендерингом
    renderProducts();
}

// Функция поиска
function searchProducts(query) {
    if (!isLoaded) {
        suggestionsBox.style.display = 'none'; // Прячем подсказки, если товары не загружены
        return; // Останавливаем выполнение функции поиска
    }

    filteredProducts = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
    catalog.innerHTML = ''; // Очистить каталог перед рендерингом
    renderProducts();

    // Показать подсказки, если есть результаты
    if (filteredProducts.length > 0) {
        suggestionsBox.innerHTML = filteredProducts.map(product => 
            `<div class="suggestion" data-id="${product.id}">${product.name}</div>`
        ).join('');
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
}

searchInput.addEventListener('input', (event) => {
    const query = event.target.value;
    searchProducts(query);
});

// Обработчик клика по подсказке
suggestionsBox.addEventListener('click', (event) => {
    if (event.target.classList.contains('suggestion')) {
        const productId = event.target.dataset.id;
        const product = products.find(p => p.id == productId);
        searchInput.value = product.name;
        searchProducts(product.name);
        suggestionsBox.style.display = 'none';
    }
});

// Закрытие подсказок, если пользователь кликает вне области поиска
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !suggestionsBox.contains(event.target)) {
        suggestionsBox.style.display = 'none';
    }
});

// Обработчики событий
document.getElementById('apply-filters').addEventListener('click', applyFilters);
document.getElementById('sort-order').addEventListener('change', (event) => {
    sortProducts(event.target.value);
});

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();  // Загружаем товары с API
});

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const productToAdd = {
        name: product.name,
        price: product.discount_price || product.actual_price,  // Цена с учетом скидки
        image: product.image_url,  // Картинка товара
        rating: product.rating  // Рейтинг товара
    };
cart.push(productToAdd);
localStorage.setItem('cart', JSON.stringify(cart));

// Показываем уведомление
const notification = document.getElementById('notification');
notification.style.display = 'block';

// Закрыть уведомление через клик
document.getElementById('close-notification').addEventListener('click', () => {
    notification.style.display = 'none';
});
}