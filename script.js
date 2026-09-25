let select = document.getElementById("type");
let para = document.getElementById("content");

select.addEventListener("change", setData);

function setData() {
    let choice = select.value;

    if (choice === "Текст") {
        para.setAttribute("type", "text");
        para.placeholder = "Введите текст";
    } 
    
    else if (choice === "Ссылка") {
        para.setAttribute("type", "url");
        para.placeholder = "Введите ссылку";
    } 
   
    else if (choice === "Изображение") {
        para.setAttribute("type", "url");
        para.placeholder = "Введите URL изображения";
    } 
   
    else {
        para.setAttribute("type", "text");
        para.placeholder = "Введите содержание";
    }
}

// Находим все нужные элементы для добавления записи
let addcontentform1 = document.querySelector(".addcontentform1");
let typeSelect = document.getElementById("type");
let addcontentform2 = document.getElementById("content");
let statusSelect2 = document.querySelector("#status");
let addcontentform3 = document.querySelector(".addcontentform3");

let button = document.querySelector('.button');
let tableBody = document.getElementById('result').querySelector('tbody');

// Тут хранятся все записи
let data = [];

// Сохраняем массив в память браузера
function saveDataToLocalStorage() {
    localStorage.setItem('diaryData', JSON.stringify(data));
}

// Загружаем данные при открытии страницы
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('diaryData');
    if (savedData) {
        data = JSON.parse(savedData); 
        renderTable(data);
    }
}
// Клик по кнопке "Добавить"
button.addEventListener("click", function () {
    let newEntry = {
        title: addcontentform1.value,
        type: typeSelect.value,
        content: addcontentform2.value,
        status: statusSelect2.value,
        date: addcontentform3.value
    };

    data.push(newEntry); // Кидаем в массив
    saveDataToLocalStorage(); // Сохраняем
    renderTable(data); // Перерисовываем таблицу

    addcontentform1.value = "";
    addcontentform2.value = "";
    addcontentform3.value = "";
});

// Функция отрисовки таблицы
function renderTable(dataToRender) {
    tableBody.innerHTML = ""; // Сначала чистим таблицу, чтобы не дублировалось

    dataToRender.forEach(item => {
        let contentCell;
        // В зависимости от типа делаем разный HTML для ячейки
        if (item.type === "Ссылка") {
            contentCell = `<td><a href="${item.content}" target="_blank">${item.content}</a></td>`;
        } else if (item.type === "Изображение") {
            // Картинку ограничиваем по ширине и делаем кликабельной
            contentCell = `<td><img src="${item.content}" alt="Изображение" style="max-width: 100px; cursor: pointer;" onclick="window.open('${item.content}', '_blank')"></td>`;
        } else {
            contentCell = `<td>${item.content}</td>`;
        }

        // Вставляем новую строку в таблицу
        tableBody.insertAdjacentHTML("beforeend", `
            <tr>
                <td>${item.title}</td>
                <td>${item.type}</td>
                ${contentCell}
                <td data-status="${item.status}">${item.status}</td>
                <td>${item.date}</td>
            </tr>
        `);
    });
}
// Получаем элементы фильтров
let statusFilterSelect = document.getElementById("statusFilter");
let dateFilterInput = document.getElementById("dateFilter");

statusFilterSelect.addEventListener("change", applyFilters);
dateFilterInput.addEventListener("change", applyFilters);

function applyFilters() {
    let statusFilterValue = statusFilterSelect.value;
    let dateFilterValue = dateFilterInput.value;

    // Оставляем только те записи, которые подходят под фильтры
    let filteredData = data.filter(item => {
        let statusMatch = !statusFilterValue || item.status === statusFilterValue;
        let dateMatch = !dateFilterValue || item.date === dateFilterValue;
        return statusMatch && dateMatch;
    });

    renderTable(filteredData); // Рисуем отфильтрованное
}

// Кнопка полной очистки
let clear = document.querySelector('.clear');
clear.addEventListener('click', function () {
    if (confirm('Вы уверены, что хотите полностью очистить таблицу?')) {
        data = [];
        localStorage.removeItem('diaryData'); // Стираем из памяти
        renderTable(data);
    }
});
let editAllButton = document.querySelector('.editall');
let isEditing = false;
let currentEditingRow = null;

// Кнопка "Редактировать всё"
editAllButton.addEventListener('click', function () {
    if (!isEditing) {
        // Включаем режим редактирования
        isEditing = true;
        editAllButton.textContent = 'Сохранить';
        addEditDeleteButtons();
    } else {
        // Выключаем
        isEditing = false;
        editAllButton.textContent = 'Редактировать';
        removeEditDeleteButtons();
        saveDataToLocalStorage();
    }
});

// Добавляем кнопки редактирования и удаления в каждую строку
function addEditDeleteButtons() {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        let actionCell = row.querySelector('.action-cell') || document.createElement('td');
        actionCell.className = 'action-cell';
        actionCell.innerHTML = '';

        // Кнопка редактирования (карандаш)
        const editButton = document.createElement('button');
        editButton.textContent = '✏️';
        editButton.className = 'edit-btn';
        editButton.onclick = () => editRow(row, index);

        // Кнопка удаления (корзина)
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteRow(index);

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        // Если ячейки не было - добавляем её в строку
        if (!row.querySelector('.action-cell')) {
            row.appendChild(actionCell);
        }
    });
}

// Убираем кнопки, когда выключаем режим редактирования
function removeEditDeleteButtons() {
    const actionCells = tableBody.querySelectorAll('.action-cell');
    actionCells.forEach(cell => cell.remove());
}
// Удаление строки
function deleteRow(index) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        data.splice(index, 1);
        saveDataToLocalStorage();
        renderTable(data);

        // Если мы в режиме редактирования, заново навешиваем кнопки
        if (isEditing) {
            addEditDeleteButtons();
        }
    }
}

// Редактирование строки
function editRow(row, index) {
    // Если кликнули на ту же строку, что уже редактируется - сохраняем
    if (currentEditingRow === row) {
        saveRowChanges(row, index);
        currentEditingRow = null;
        return;
    }

    // Если до этого редактировали другую строку - сначала сохраняем там
    if (currentEditingRow) {
        const currentIndex = Array.from(tableBody.children).indexOf(currentEditingRow);
        saveRowChanges(currentEditingRow, currentIndex);
    }

    currentEditingRow = row;

    const cells = row.cells;
    // Запоминаем старые данные
    const originalData = {
        title: cells[0].textContent,
        type: cells[1].textContent,
        content: cells[2].textContent,
        status: cells[3].textContent,
        date: cells[4].textContent
    };

    // Достаем оригинальный контент из HTML
    let originalContent;
    if (originalData.type === "Ссылка" && cells[2].querySelector('a')) {
        originalContent = cells[2].querySelector('a').href;
    } else if (originalData.type === "Изображение" && cells[2].querySelector('img')) {
        originalContent = cells[2].querySelector('img').src;
    } else {
        originalContent = originalData.content;
    }

    // Превращаем ячейки в инпуты и селекты для редактирования
    cells[0].innerHTML = `<input type="text" value="${originalData.title}">`;
    cells[1].innerHTML = `
        <select>
            <option value="Текст" ${originalData.type === 'Текст' ? 'selected' : ''}>Текст</option>
            <option value="Ссылка" ${originalData.type === 'Ссылка' ? 'selected' : ''}>Ссылка</option>
            <option value="Изображение" ${originalData.type === 'Изображение' ? 'selected' : ''}>Изображение</option>
        </select>
    `;
    cells[2].innerHTML = `<input type="text" value="${originalContent}">`;
    cells[3].innerHTML = `
        <select>
            <option value="Сделано" ${originalData.status === 'Сделано' ? 'selected' : ''}>Сделано</option>
            <option value="В процессе" ${originalData.status === 'В процессе' ? 'selected' : ''}>В процессе</option>
            <option value="Не сделано" ${originalData.status === 'Не сделано' ? 'selected' : ''}>Не сделано</option>
        </select>
    `;
    cells[4].innerHTML = `<input type="date" value="${originalData.date}">`;

    // Меняем иконку на "сохранить"
    const editButton = cells[5]?.querySelector('button');
    if (editButton) {
        editButton.textContent = '💾';
    }
}
// Сохраняем то, что наредактировали в строке
function saveRowChanges(row, index) {
    const cells = row.cells;
    // Собираем ссылки на инпуты
    const inputs = {
        title: cells[0].querySelector('input'),
        type: cells[1].querySelector('select'),
        content: cells[2].querySelector('input') || cells[2].querySelector('a') || cells[2].querySelector('img'),
        status: cells[3].querySelector('select'),
        date: cells[4].querySelector('input')
    };

    // Достаем значение контента в зависимости от того, что это за тег
    let contentValue;
    if (inputs.content.tagName === 'INPUT') {
        contentValue = inputs.content.value;
    } else if (inputs.content.tagName === 'A') {
        contentValue = inputs.content.href;
    } else if (inputs.content.tagName === 'IMG') {
        contentValue = inputs.content.src;
    }

    // Обновляем данные в массиве
    data[index] = {
        title: inputs.title.value,
        type: inputs.type.value,
        content: contentValue,
        status: inputs.status.value,
        date: inputs.date.value
    };

    // Возвращаем ячейкам обычный вид
    cells[0].textContent = data[index].title;
    cells[1].textContent = data[index].type;

    // Формируем HTML для контента обратно
    if (data[index].type === "Ссылка") {
        cells[2].innerHTML = `<a href="${data[index].content}" target="_blank">${data[index].content}</a>`;
    } else if (data[index].type === "Изображение") {
        cells[2].innerHTML = `<img src="${data[index].content}" alt="Изображение" style="max-width: 100px; cursor: pointer;" onclick="window.open('${data[index].content}', '_blank')">`;
    } else {
        cells[2].textContent = data[index].content;
    }

    cells[3].innerHTML = `<td data-status="${data[index].status}">${data[index].status}</td>`;
    cells[4].textContent = data[index].date;

    // Возвращаем иконку карандаша
    const editButton = cells[5]?.querySelector('button');
    if (editButton) {
        editButton.textContent = '✏️';
    }
}

// Запускаем загрузку данных, когда страница полностью прогрузилась
document.addEventListener('DOMContentLoaded', loadDataFromLocalStorage);