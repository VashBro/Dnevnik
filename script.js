let select = document.getElementById("type");
let para = document.getElementById("content");

select.addEventListener("change", setData);

function setData() {
    let choice = select.value;
    if (choice === "Текст") {
        para.setAttribute("type", "text");
        para.placeholder = "Введите текст";
    } else if (choice === "Ссылка") {
        para.setAttribute("type", "url");
        para.placeholder = "Введите ссылку";
    } else if (choice === "Изображение") {
        para.setAttribute("type", "url");
        para.placeholder = "Введите URL изображения";
    } else {
        para.setAttribute("type", "text");
        para.placeholder = "Введите содержание";
    }
}

let addcontentform1 = document.querySelector(".addcontentform1");
let typeSelect = document.getElementById("type");
let addcontentform2 = document.getElementById("content");
let statusSelect2 = document.querySelector("#status");
let addcontentform3 = document.querySelector(".addcontentform3");

let button = document.querySelector('.button');
let tableBody = document.getElementById('result').querySelector('tbody');

let data = [];

// Функция для сохранения данных в localStorage
function saveDataToLocalStorage() {
    localStorage.setItem('diaryData', JSON.stringify(data));
}

// Функция для загрузки данных из localStorage
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('diaryData');
    if (savedData) {
        data = JSON.parse(savedData);
        renderTable(data);
    }
}

button.addEventListener("click", function () {
    let newEntry = {
        title: addcontentform1.value,
        type: typeSelect.value,
        content: addcontentform2.value,
        status: statusSelect2.value,
        date: addcontentform3.value
    };

    data.push(newEntry);
    saveDataToLocalStorage(); // Сохраняем данные
    renderTable(data);

    addcontentform1.value = "";
    addcontentform2.value = "";
    addcontentform3.value = "";
});

function renderTable(dataToRender) {
    tableBody.innerHTML = "";
    dataToRender.forEach(item => {
        let contentCell;
        if (item.type === "Ссылка") {
            contentCell = `<td><a href="${item.content}" target="_blank">${item.content}</a></td>`;
        } else if (item.type === "Изображение") {
            contentCell = `<td><img src="${item.content}" alt="Изображение" style="max-width: 100px; cursor: pointer;" onclick="window.open('${item.content}', '_blank')"></td>`;
        } else {
            contentCell = `<td>${item.content}</td>`;
        }

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

    // Если мы в режиме редактирования, обновляем кнопки
    if (isEditing) {
        addEditDeleteButtons();
    }
}

let statusFilterSelect = document.getElementById("statusFilter");
let dateFilterInput = document.getElementById("dateFilter");

statusFilterSelect.addEventListener("change", applyFilters);
dateFilterInput.addEventListener("change", applyFilters);

function applyFilters() {
    let statusFilterValue = statusFilterSelect.value;
    let dateFilterValue = dateFilterInput.value;

    let filteredData = data.filter(item => {
        let statusMatch = !statusFilterValue || item.status === statusFilterValue;
        let dateMatch = !dateFilterValue || item.date === dateFilterValue;
        return statusMatch && dateMatch;
    });

    renderTable(filteredData);
    saveDataToLocalStorage(); // Сохраняем данные после фильтрации
}

// ... (предыдущий код остается без изменений)

// Очистка таблицы
let clear = document.querySelector('.clear');
clear.addEventListener('click', function () {
    if (confirm('Вы уверены, что хотите полностью очистить таблицу?')) {
        data = [];
        localStorage.removeItem('diaryData');
        renderTable(data);
    }
});



let editAllButton = document.querySelector('.editall');
let isEditing = false;
let currentEditingRow = null;

editAllButton.addEventListener('click', function () {
    if (!isEditing) {
        // Входим в режим редактирования
        isEditing = true;
        editAllButton.textContent = 'Сохранить';
        addEditDeleteButtons();
    } else {
        // Выходим из режима редактирования
        isEditing = false;
        editAllButton.textContent = 'Редактировать';
        removeEditDeleteButtons();
        saveDataToLocalStorage();
    }
});

function addEditDeleteButtons() {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        // Создаем ячейку для кнопок, если её нет
        let actionCell = row.querySelector('.action-cell') || document.createElement('td');
        actionCell.className = 'action-cell';
        actionCell.innerHTML = '';

        // Кнопка редактирования
        const editButton = document.createElement('button');
        editButton.textContent = '✏️';
        editButton.className = 'edit-btn';
        editButton.onclick = () => editRow(row, index);

        // Кнопка удаления
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '🗑️';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteRow(index);

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        if (!row.querySelector('.action-cell')) {
            row.appendChild(actionCell);
        }
    });
}

function removeEditDeleteButtons() {
    const actionCells = tableBody.querySelectorAll('.action-cell');
    actionCells.forEach(cell => cell.remove());
}

function deleteRow(index) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        data.splice(index, 1);
        saveDataToLocalStorage();
        renderTable(data);

        // Если мы в режиме редактирования, обновляем кнопки
        if (isEditing) {
            addEditDeleteButtons();
        }
    }
}



function editRow(row, index) {
    if (currentEditingRow === row) {
        // Завершаем редактирование текущей строки
        saveRowChanges(row, index);
        currentEditingRow = null;
        return;
    }

    // Если уже редактируется другая строка, сначала сохраняем её
    if (currentEditingRow) {
        const currentIndex = Array.from(tableBody.children).indexOf(currentEditingRow);
        saveRowChanges(currentEditingRow, currentIndex);
    }

    // Начинаем редактирование новой строки
    currentEditingRow = row;

    // Получаем данные из строки
    const cells = row.cells;
    const originalData = {
        title: cells[0].textContent,
        type: cells[1].textContent,
        content: cells[2].textContent,
        status: cells[3].textContent,
        date: cells[4].textContent
    };

    // Если в ячейке content была ссылка или изображение, получаем исходное значение
    let originalContent;
    if (originalData.type === "Ссылка" && cells[2].querySelector('a')) {
        originalContent = cells[2].querySelector('a').href;
    } else if (originalData.type === "Изображение" && cells[2].querySelector('img')) {
        originalContent = cells[2].querySelector('img').src;
    } else {
        originalContent = originalData.content;
    }

    // Заменяем ячейки на поля ввода
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

    // Изменяем кнопку на "Сохранить"
    const editButton = cells[5]?.querySelector('button');
    if (editButton) {
        editButton.textContent = '💾';
    }
}

function saveRowChanges(row, index) {
    const cells = row.cells;
    const inputs = {
        title: cells[0].querySelector('input'),
        type: cells[1].querySelector('select'),
        content: cells[2].querySelector('input') || cells[2].querySelector('a') || cells[2].querySelector('img'),
        status: cells[3].querySelector('select'),
        date: cells[4].querySelector('input')
    };

    // Получаем значение content в зависимости от типа
    let contentValue;
    if (inputs.content.tagName === 'INPUT') {
        contentValue = inputs.content.value;
    } else if (inputs.content.tagName === 'A') {
        contentValue = inputs.content.href;
    } else if (inputs.content.tagName === 'IMG') {
        contentValue = inputs.content.src;
    }

    // Обновляем данные
    data[index] = {
        title: inputs.title.value,
        type: inputs.type.value,
        content: contentValue,
        status: inputs.status.value,
        date: inputs.date.value
    };

    // Возвращаем обычные ячейки
    cells[0].textContent = data[index].title;
    cells[1].textContent = data[index].type;

    if (data[index].type === "Ссылка") {
        cells[2].innerHTML = `<a href="${data[index].content}" target="_blank">${data[index].content}</a>`;
    } else if (data[index].type === "Изображение") {
        cells[2].innerHTML = `<img src="${data[index].content}" alt="Изображение" style="max-width: 100px; cursor: pointer;" onclick="window.open('${data[index].content}', '_blank')">`;
    } else {
        cells[2].textContent = data[index].content;
    }

    cells[3].innerHTML = `<td data-status="${data[index].status}">${data[index].status}</td>`;
    cells[4].textContent = data[index].date;

    // Возвращаем кнопку редактирования
    const editButton = cells[5]?.querySelector('button');
    if (editButton) {
        editButton.textContent = '✏️';
    }
}




// Загружаем данные при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDataFromLocalStorage);
