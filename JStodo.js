let todosByDate = {};
let selectedDate = new Date().toISOString().split('T')[0];
let flatpickrInstance;

// Flatpickr 설정
function initializeFlatpickr() {
    flatpickrInstance = flatpickr("#dateSelector", {
        locale: 'ko',
        dateFormat: "Y-m-d",
        defaultDate: selectedDate,
        onChange: function(selectedDates, dateStr) {
            selectedDate = dateStr;
            updateSelectedDateDisplay();
            renderTodos();
        },
        onMonthChange: function() {
            setTimeout(updateDateDots, 100);  // 월 변경 시 dot 업데이트
        },
        onYearChange: function() {
            setTimeout(updateDateDots, 100);  // 년 변경 시 dot 업데이트
        },
        onOpen: function() {
            setTimeout(updateDateDots, 100);  // 캘린더 열 때 dot 업데이트
        }
    });
}

// 선택된 날짜 표시 업데이트
function updateSelectedDateDisplay() {
    const dateDisplay = document.querySelector('.selected-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const displayDate = new Date(selectedDate).toLocaleDateString('ko-KR', options);
    dateDisplay.textContent = displayDate;
}

// 날짜별 점 업데이트
function updateDateDots() {
    
    const calendar = document.querySelector('.flatpickr-calendar');
    if (!calendar) return;

    const days = calendar.querySelectorAll('.flatpickr-day:not(.prevMonthDay):not(.nextMonthDay)');
    days.forEach(day => {
        // 기존 점 제거
        const existingDot = day.querySelector('.event-dot');
        if (existingDot) existingDot.remove();

        // 날짜 가져오기
        const dateStr = day.getAttribute('aria-label');
        if (!dateStr) return;

        try {
            const formattedDate = flatpickrInstance.formatDate(
                flatpickrInstance.parseDate(dateStr, 'F j, Y'),
                'Y-m-d'
            );
            
            console.log('Formatted date:', formattedDate);

            // 해당 날짜에 일정이 있는 경우에만 점 추가
            if (todosByDate[formattedDate] && todosByDate[formattedDate].length > 0) {
                const dot = document.createElement('span');
                dot.className = 'event-dot';
                day.appendChild(dot);
            }
        } catch (e) {
            console.error('Error processing date:', dateStr, e);
        }
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (text === '') return;
    
    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        isNew: true,
        date: selectedDate
    };
    
    if (!todosByDate[selectedDate]) {
        todosByDate[selectedDate] = [];
    }
    
    todosByDate[selectedDate].push(todo);
    input.value = '';
    renderTodos();
    
    // 일정 추가 후 캘린더 업데이트
    setTimeout(updateDateDots, 100);
}

function deleteTodo(id) {
    todosByDate[selectedDate] = todosByDate[selectedDate].filter(todo => todo.id !== id);
    renderTodos();
    
    // 일정 삭제 후 캘린더 업데이트
    setTimeout(updateDateDots, 100);
}

function toggleComplete(id) {
    todosByDate[selectedDate] = todosByDate[selectedDate].map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todoList');
    todoList.innerHTML = '';
    
    const todosForSelectedDate = todosByDate[selectedDate] || [];
    
    todosForSelectedDate.forEach((todo) => {
        const li = document.createElement('li');
        li.setAttribute('data-id', todo.id);
        
        li.innerHTML = `
            <div class="todo-content">
                <input type="checkbox" 
                    class="todo-checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onclick="toggleComplete(${todo.id})"
                >
                <div class="text-wrapper">
                    <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
                </div>
            </div>
            <div class="action-buttons">
                <button onclick="deleteTodo(${todo.id})" class="delete-btn">삭제</button>
            </div>
        `;
        
        if (todo.isNew) {
            li.classList.add('new-item');
            setTimeout(() => {
                li.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            todo.isNew = false;
        }
        
        todoList.appendChild(li);
    });

    // Sortable 초기화
    new Sortable(todoList, {
        animation: 150,
        cursor: 'move',
        onEnd: function(evt) {
            const items = [...todoList.querySelectorAll('li')];
            todosByDate[selectedDate] = items.map(item => {
                const id = parseInt(item.getAttribute('data-id'));
                return todosByDate[selectedDate].find(todo => todo.id === id);
            });
        }
    });
}

document.getElementById('todoInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTodo();
    }
});

window.addEventListener('DOMContentLoaded', function() {
    initializeFlatpickr();
    updateSelectedDateDisplay();
    renderTodos();
    updateDateDots(); 
});