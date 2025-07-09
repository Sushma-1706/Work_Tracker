// 🧸 --- VANILLA JAVASCRIPT LOGIC --- 🧸
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const lofiToggle = document.getElementById('lofi-toggle');
    const lofiPlayer = document.getElementById('lofi-player');
    const progressRing = document.getElementById('progress-ring');
    const streakCounter = document.getElementById('streak-counter');
    const moodSelector = document.getElementById('mood-selector');
    const motivationalMessage = document.getElementById('motivational-message');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const taskForm = document.getElementById('task-form');
    const formCancelBtn = document.getElementById('form-cancel-btn');
    const taskListContainer = document.getElementById('task-list');
    const modalTitle = document.getElementById('modal-title');
    const formSubmitBtn = document.getElementById('form-submit-btn');
    const mascot = document.getElementById('mascot-bot');
    const viewBtns = document.querySelectorAll('.view-btn');
    const views = document.querySelectorAll('.view');
    
    // Calendar elements
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const calendarGrid = document.getElementById('calendar-days-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    
    // --- State Management ---
    let tasks = JSON.parse(localStorage.getItem('cutieTasks')) || [];
    let editingTaskId = null;
    let calendarDate = new Date();

    // --- Core Functions ---

    const getTodayString = () => new Date().toISOString().split('T')[0];
    
    const saveState = () => {
        localStorage.setItem('cutieTasks', JSON.stringify(tasks));
        renderAll();
    };

    const renderAll = () => {
        const currentView = document.querySelector('.view.active').id;
        if(currentView === 'tasks-view'){
            const selectedDay = document.querySelector('.calendar-day.selected');
            if (selectedDay) {
                renderTasks(selectedDay.dataset.date);
            } else {
                renderTasks(); // Render all if no date is specifically selected
            }
        }
        updateDashboard();
        renderCalendar();
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const suffix = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${suffix}`;
    };

    const renderTasks = (filterDate = null) => {
        let tasksToRender = tasks;
        
        if(filterDate){
            tasksToRender = tasks.filter(t => t.date === filterDate)
        }
       
        // Sort by id (creation time) to maintain order unless reordered
        tasksToRender.sort((a,b) => tasks.indexOf(a) - tasks.indexOf(b));

        taskListContainer.innerHTML = '';

        if (tasksToRender.length === 0) {
            taskListContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 2rem;">No tasks for this day! 💖</p>`;
            if(!filterDate) {
                 taskListContainer.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 2rem;">No tasks yet! Add one to get started. 💖</p>`;
            }
            return;
        }

        tasksToRender.forEach(task => {
            const isCompleted = task.status === 'Completed';
            const taskCard = document.createElement('div');
            taskCard.className = `task-card ${isCompleted ? 'completed' : ''}`;
            taskCard.dataset.id = task.id;
            taskCard.dataset.priority = task.priority;
            taskCard.draggable = true;

            taskCard.innerHTML = `
                <input type="checkbox" class="task-complete-checkbox" ${isCompleted ? 'checked' : ''} title="Mark as complete">
                <span class="task-sticker">${task.sticker}</span>
                <div class="task-content">
                    <p class="task-title">${task.title}</p>
                    <div class="task-details">
                        <p>📅 ${task.date}</p>
                        ${task.startTime ? `<p>⏰ ${formatTime(task.startTime)} - ${formatTime(task.endTime)}</p>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" title="Edit task">✏️</button>
                    <button class="delete-btn" title="Delete task">🗑️</button>
                </div>
            `;
            taskListContainer.appendChild(taskCard);
        });
    };

    // --- Dashboard & Unique Features ---
    const updateDashboard = () => {
        // Progress Ring
        const todayTasks = tasks.filter(t => t.date === getTodayString());
        const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
        const progressPercent = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
        progressRing.textContent = `${progressPercent}%`;
        progressRing.style.background = `
            radial-gradient(closest-side, var(--card-bg) 79%, transparent 80% 100%),
            conic-gradient(var(--progress-ring-fg) ${progressPercent}%, var(--progress-ring-bg) 0)
        `;

        // Streak Tracker
        const streakData = JSON.parse(localStorage.getItem('cutieStreak')) || { count: 0, lastCompleted: null };
        const today = getTodayString();
        const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

        if (streakData.lastCompleted && streakData.lastCompleted < yesterday) {
            streakData.count = 0; // Streak broken
        }
        streakCounter.textContent = streakData.count;
        localStorage.setItem('cutieStreak', JSON.stringify(streakData));

        // Initial Mascot State
        if (!mascot.classList.contains('cheer')) {
            mascot.classList.add('idle');
        }
    };
    
    const updateStreak = () => {
         const streakData = JSON.parse(localStorage.getItem('cutieStreak')) || { count: 0, lastCompleted: null };
         const today = getTodayString();

         if(streakData.lastCompleted !== today) {
            const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
            if(streakData.lastCompleted === yesterday) {
                streakData.count++; // Continue streak
            } else {
                streakData.count = 1; // New or broken streak
            }
            streakData.lastCompleted = today;
            localStorage.setItem('cutieStreak', JSON.stringify(streakData));
            updateDashboard();
         }
    }
    
    // --- Modal & Form Handling ---
    const showModal = (isEdit = false, task = null) => {
        taskForm.reset();
        editingTaskId = task ? task.id : null;
        modalTitle.textContent = isEdit ? 'Edit Task ✍️' : 'New Task ✨';
        formSubmitBtn.textContent = isEdit ? 'Update Task' : 'Add Task';
        
        if(isEdit && task) {
            document.getElementById('task-id').value = task.id;
            document.getElementById('task-title-input').value = task.title;
            document.getElementById('task-date-input').value = task.date;
            document.getElementById('task-sticker-input').value = task.sticker;
            document.getElementById('task-start-time-input').value = task.startTime;
            document.getElementById('task-end-time-input').value = task.endTime;
            document.getElementById('task-priority-input').value = task.priority;
            document.getElementById('task-status-input').value = task.status;
        } else {
             document.getElementById('task-date-input').value = new Date().toISOString().split('T')[0];
        }
        taskModal.classList.add('show');
    };

    const hideModal = () => {
        taskModal.classList.remove('show');
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskData = {
            id: editingTaskId || Date.now(),
            title: document.getElementById('task-title-input').value,
            date: document.getElementById('task-date-input').value,
            sticker: document.getElementById('task-sticker-input').value,
            startTime: document.getElementById('task-start-time-input').value,
            endTime: document.getElementById('task-end-time-input').value,
            priority: document.getElementById('task-priority-input').value,
            status: document.getElementById('task-status-input').value
        };

        if(editingTaskId) {
            tasks = tasks.map(t => t.id === editingTaskId ? taskData : t);
        } else {
            tasks.push(taskData);
        }
        saveState();
        hideModal();
    });

    // --- Event Listeners ---
    themeSwitcher.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeSwitcher.textContent = isDarkMode ? '☀️' : '🌙';
        localStorage.setItem('cutieTheme', isDarkMode ? 'dark' : 'light');
    });
    
    lofiToggle.addEventListener('click', () => {
        if(lofiPlayer.paused) {
            lofiPlayer.play().catch(e => console.error("Audio play failed:", e));
            lofiToggle.textContent = '⏸️';
        } else {
            lofiPlayer.pause();
            lofiToggle.textContent = '🎵';
        }
    });
    
    moodSelector.addEventListener('change', (e) => {
        const mood = e.target.value;
        const messages = {
            happy: "Awesome! Let's make today great!",
            neutral: "Okay, let's get things done and feel amazing.",
            tired: "It's okay to feel tired. Take a small step, that's enough!"
        };
        motivationalMessage.textContent = messages[mood];
    });
    
    addTaskBtn.addEventListener('click', () => showModal());
    formCancelBtn.addEventListener('click', hideModal);
    taskModal.addEventListener('click', (e) => {
         if (e.target === taskModal) hideModal();
    });
    
    taskListContainer.addEventListener('click', (e) => {
        const taskCard = e.target.closest('.task-card');
        if (!taskCard) return;
        const taskId = Number(taskCard.dataset.id);

        if (e.target.classList.contains('delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveState();
        } else if (e.target.classList.contains('edit-btn')) {
            const taskToEdit = tasks.find(t => t.id === taskId);
            showModal(true, taskToEdit);
        } else if (e.target.classList.contains('task-complete-checkbox')) {
            const taskToUpdate = tasks.find(t => t.id === taskId);
            const isCompleted = e.target.checked;
            taskToUpdate.status = isCompleted ? 'Completed' : 'In Progress';
            
            if (isCompleted) {
                updateStreak();
                cheerMascot();
            }
            saveState();
        }
    });

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewName = btn.dataset.view;
            views.forEach(view => view.classList.remove('active'));
            document.getElementById(`${viewName}-view`).classList.add('active');
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // When switching to task view, de-select calendar day and show all tasks
            if (viewName === 'tasks') {
                 const selectedDay = document.querySelector('.calendar-day.selected');
                 if(selectedDay) selectedDay.classList.remove('selected');
                 renderTasks();
            }
        });
    });

    // --- Drag and Drop ---
    let draggedItem = null;

    taskListContainer.addEventListener('dragstart', (e) => {
        draggedItem = e.target.closest('.task-card');
        if(draggedItem) {
            setTimeout(() => {
                draggedItem.classList.add('dragging');
            }, 0);
        }
    });

    taskListContainer.addEventListener('dragend', () => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            const orderedIds = Array.from(taskListContainer.querySelectorAll('.task-card')).map(card => Number(card.dataset.id));
            tasks.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
            saveState(); // Save the new order
            draggedItem = null;
        }
    });
    

    taskListContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskListContainer, e.clientY);
        const currentDraggable = document.querySelector('.dragging');
        if (afterElement == null) {
            taskListContainer.appendChild(currentDraggable);
        } else {
            taskListContainer.insertBefore(currentDraggable, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // --- Mini Calendar ---
    const renderCalendar = () => {
        calendarGrid.innerHTML = '';
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        
        calendarMonthYear.textContent = `${calendarDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(name => {
            const dayNameEl = document.createElement('div');
            dayNameEl.className = 'calendar-day-name';
            dayNameEl.textContent = name;
            calendarGrid.appendChild(dayNameEl);
        });

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyEl);
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            dayEl.dataset.date = dayString;

            if (dayString === getTodayString()) dayEl.classList.add('today');

            const selectedDay = document.querySelector('.calendar-day.selected');
            if(selectedDay && selectedDay.dataset.date === dayString) dayEl.classList.add('selected');
            
            if (tasks.some(t => t.date === dayString)) dayEl.classList.add('has-tasks');
            
            calendarGrid.appendChild(dayEl);
        }
    };
    
    calendarGrid.addEventListener('click', (e) => {
        const dayEl = e.target.closest('.calendar-day');
        if(dayEl && !dayEl.classList.contains('other-month')) {
            // Un-select previous day
            const previouslySelected = document.querySelector('.calendar-day.selected');
            if(previouslySelected) previouslySelected.classList.remove('selected');

            // Select new day
            dayEl.classList.add('selected');
            const selectedDate = dayEl.dataset.date;
            
            // Switch to task view and filter by this date
            document.querySelector('.view-btn[data-view="tasks"]').click();
            dayEl.classList.add('selected'); // re-add selected after click handler runs
            renderTasks(selectedDate);
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        calendarDate.setMonth(calendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    // --- Notifications & Mascot ---
    const cheerMascot = () => {
        mascot.classList.remove('idle');
        mascot.classList.add('cheer');
        setTimeout(() => {
            mascot.classList.remove('cheer');
            mascot.classList.add('idle');
        }, 3000); // Cheer for 3 seconds
    };

    const scheduleReminderNotifications = () => {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        
        const now = new Date();
        const reminderWindow = 10 * 60 * 1000; // 10 minutes

        tasks.forEach(task => {
            if (task.status !== 'Completed' && task.startTime) {
                const taskTime = new Date(`${task.date}T${task.startTime}`);
                const timeToTask = taskTime.getTime() - now.getTime();
                
                if (timeToTask > 0 && timeToTask < reminderWindow) {
                     setTimeout(() => {
                        new Notification('CutieTask Reminder! 🎀', {
                            body: `Your task "${task.title}" is starting soon!`,
                            icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIaSURBVGhD7Zk/S8NAGMWvMiskLopDB9dBERwFwcVBxyroLXSTILgJvoZfQnA3xZ+guIm6OLgLN0FEUZBEXCQfweEnaXkp9dHv5g6EpqTUvjYg5w+E1Jv3vpukpPSBAgAAAJin5B9ASvOaVbKi2zHlHZCkDMkLgCwlUH3f2k4m/GBl0v30iEgkAoOBoP6/0iA58RaF3IAn3YxX8Al84nnyBv3/F0LLbIasYpyyAWT4jAYrvgxgg3nPz2kRoaTfgaDLRqE1Sj0pNehB9+5LwPAGcOAtFkK3rKbd4lQKpVIpUVE3gTcHPAe42zUqNMMgGhwnlMKNdCcIfDqR0lBchpGkZTbVsoVZSl2dD8fT01p2bBSRpGWWpudSg+o0G/n+gqTUZB+WugJrtwHkWvAGWJm/k9f5hIYiX31h1E4W4uG4oFpB3u+74jV5Mh+uH+v7wKe+u3qWj4zt4S9P6uGVwuDyz5vPEX1dVOxZlM8yQcOt3R2Wn20/a9jY3vBFl+6yPfhvwqWVJ39qS/YPM6Vd9E/TQaPqjBlk2vE1+24fIqV61dC7gYgL9yQ9Im7y8Yk6P9uTzJjw3K4rVHrQyPklDlHtkGjPzQeAcYIQHfsFh46IuEAPGKiDjgg+B6D1Ew+iW+A0p+8tDAAAAAD85J/wAdtT1IhxNY8jAAAAAElFTkSuQmCC' // A generic cute icon
                        });
                     }, timeToTask);
                }
            }
        });
    };
    
    // --- Initial Load ---
    const init = () => {
        // Load theme preference
        const savedTheme = localStorage.getItem('cutieTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeSwitcher.textContent = '☀️';
        }
        // Ask for notification permission on load
        if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        renderAll();
        // Check for upcoming tasks periodically
        setInterval(scheduleReminderNotifications, 60 * 1000); // Check every minute
    };

    init();
});