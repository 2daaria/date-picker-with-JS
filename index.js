const datepicker = document.querySelector('.datepicker');
const rangeInput = document.querySelector('input');
const calendarContainer = datepicker.querySelector('.calendar');
const leftCalendar = datepicker.querySelector('.left-side');
const rightCalendar = datepicker.querySelector('.right-side');
const prevBtn = datepicker.querySelector('.prev');
const nextBtn = datepicker.querySelector('.next');
const selectedDatesElement = datepicker.querySelector('.selection');
const applyBtn = datepicker.querySelector('.apply');
const cancelBtn = datepicker.querySelector('.cancel');

let start = null;
let end = null;
let originalStart = null;
let originalEnd = null;

let leftDate = new Date(); // Текущая дата
leftDate.setDate(1);
let rightDate = new Date(leftDate); // Копия этой даты
rightDate.setMonth(rightDate.getMonth() + 1); // Сдвиг на 1 месяц вперёд

// форматирование дат ДД.ММ.ГГГГ (внизу календаря)
const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0'); // приводим нумерацию месяцев к 1-12, добавляем 0 слева, если строка меньше 2 символов
    const d = String(date.getDate()).padStart(2, '0'); // добавляем 0 слева, если строка меньше 2 символов
    return `${d}-${m}-${y}`;
}

// создание span с датой + переключение классов
const createDateElement = (date, isDisabled, isToday) => {
    const span = document.createElement('span');
    span.textContent = date.getDate();
    span.classList.toggle('disabled', isDisabled);
    if (!isDisabled) {
        span.classList.toggle('today', isToday);
        /*span.setAttribute('data-date', formatDate(date))*/
        span.dataset.date = date.toISOString();
    }

    span.addEventListener('click', handleDateClick);
    span.addEventListener('mouseover', handleDateMouseover);


    return span;
};

// показывать даты при выборе периода
const displaySelectedDates = () => {
    if (start && end) {
        const startDate = start.toLocaleDateString('ru');
        const endDate = end.toLocaleDateString('ru');
        selectedDatesElement.textContent = `${startDate} - ${endDate}`;
    } else if (!end) {
        selectedDatesElement.textContent = '';
    }
}

// показывать выделения дат и периода
const applySelectedRange = () => {
    // удалить предыдущее выделение периода
    const dateElements = datepicker.querySelectorAll('span[data-date]');
    for (const dateElement of dateElements) {
        dateElement.classList.remove('range-start', 'range-end', 'in-range');
    }

    // выделить начальную дату периода
    if (start) {
        /*const startDate = formatDate(start);
        const startElement = datepicker.querySelector(`span[data-date="${startDate}"]`);*/
        const startDate = start.toISOString();
        const startElement = datepicker.querySelector(`span[data-date="${startDate}"]`);

        if (startElement) {
            startElement.classList.add('range-start');
            if (!end) startElement.classList.add('range-end');
        }
    }

    // выделить конечную дату периода
    if (end) {
        /*const startDate = formatDate(start);
        const startElement = datepicker.querySelector(`span[data-date="${startDate}"]`);*/
        const endDate = end.toISOString();
        const endElement = datepicker.querySelector(`span[data-date="${endDate}"]`);

        if (endElement) endElement.classList.add('range-end');
    }

    // выделить период между начальной и конечной датой
    if (start && end) {
        for (const dateElement of dateElements) {
            const date = new Date(dateElement.dataset.date);
            if (date > start && date < end) {
                dateElement.classList.add('in-range');
            }
        }
    }
}

const handleDateMouseover = (event) => {
    const hoverElement = event.target;
    if (start && !end) {
        applySelectedRange();
        const hoverDate = new Date(hoverElement.dataset.date);
        datepicker.querySelectorAll("span[data-date]").forEach((dateElement) => {
            const date = new Date(dateElement.dataset.date);
            if (date > start && date < hoverDate && start < hoverDate) {
                dateElement.classList.add('in-range');
            }
        });
    }
}

const handleDateClick = (event) => {
    const dateElement = event.target;
    const selectedDate = new Date(dateElement.dataset.date);

    if (!start || (start && end)) {
        // первый клик или выбор нового периода
        start = selectedDate;
        end = null;
    } else if (selectedDate < start) {
        // дата по клику до стартовой даты
        start = selectedDate;
    } else {
        // в остальных случаях как дата окончания периода
        end = selectedDate;
    }

    applySelectedRange();
    displaySelectedDates();
}

// устанавливаем лейбл MONTH YYYY (шапка календаря)
const renderCalendar = (calendar, year, month) => {
    const label = calendar.querySelector('.label');
    label.textContent = new Date(year, month).toLocaleDateString('en',
        {
            year: 'numeric',
            month: 'long',
        }
    ); // MONTH YYYY

    // очищает ячейки дат в html
    const datesContainer = calendar.querySelector('.dates');
    datesContainer.innerHTML = '';

    // начать с понедельника - !!!!! проверить потом
    const startDate = new Date(year, month, 1);
    let day = startDate.getDay(); // 0 (вс) ... 6 (сб)
    if (day === 0) day = 7; // сделать воскресенье = 7
    startDate.setDate(startDate.getDate() - (day - 1));
    /*startDate.setDate(startDate.getDate() - startDate.getDay());*/

    // конец календаря (6 недель или 42 дня)
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 42);

    const fragment = document.createDocumentFragment();
    while (startDate < endDate) {
        const isDisabled = startDate.getMonth() !== month;
        const isToday = formatDate(startDate) === formatDate(new Date());
        const dateElement = createDateElement(startDate, isDisabled, isToday);
        fragment.appendChild(dateElement);
        startDate.setDate(startDate.getDate() + 1);
    }

    datesContainer.appendChild(fragment);

    applySelectedRange()

};

// функция обновления календаря
const updateCalendar = () => {
    renderCalendar(leftCalendar, leftDate.getFullYear(), leftDate.getMonth());
    renderCalendar(rightCalendar, rightDate.getFullYear(), rightDate.getMonth());
}

// показать календарь при фокусе на инпут
rangeInput.addEventListener('focus', () => {
    originalStart = start;
    originalEnd = end;
    calendarContainer.hidden = false;
});

// скрыть календарь при клике вне календаря
document.addEventListener('click', (event) => {
    if (!datepicker.contains(event.target)) {
        calendarContainer.hidden = true;
    }
});

// навигация для prev месяца
prevBtn.addEventListener('click', () => {
    leftDate.setMonth(leftDate.getMonth() - 1);
    rightDate.setMonth(rightDate.getMonth() - 1);
    updateCalendar();
})

// навигация для next месяца
nextBtn.addEventListener('click', () => {
    leftDate.setMonth(leftDate.getMonth() + 1);
    rightDate.setMonth(rightDate.getMonth() + 1);
    updateCalendar();
})

// событие по клику на apply кнопке
applyBtn.addEventListener('click', () => {
    if (start && end) {
        const startDate = start.toLocaleDateString('ru');
        const endDate = end.toLocaleDateString('ru');
        rangeInput.value = `${startDate} - ${endDate}`;
        calendarContainer.hidden = true;
    }
});

// событие по клику на cancel кнопке
cancelBtn.addEventListener('click', () => {
    start = originalStart;
    end = originalEnd;
    applySelectedRange();
    displaySelectedDates();
    calendarContainer.hidden = true;
});

updateCalendar();