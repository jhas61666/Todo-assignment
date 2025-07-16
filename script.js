 
    const apiURL = 'https://dummyjson.com/todos';
    let todos = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    const todoList = document.getElementById('todoList');
    const pagination = document.getElementById('pagination');
    const loading = document.getElementById('loading');
    const errorBox = document.getElementById('error');
    const successBox = document.getElementById('success');
    const themeSelect = document.getElementById('themeSelect');

    const fetchTodos = async () => {
      showLoading(true);
      try {
        const res = await fetch(`${apiURL}?limit=100`);
        const data = await res.json();
        todos = data.todos.map(todo => ({ ...todo, date: randomDate() }));
        renderTodos();
      } catch (err) {
        showError('Failed to fetch todos.');
      } finally {
        showLoading(false);
      }
    };

    const showLoading = (state) => loading.style.display = state ? 'block' : 'none';
    const showError = (msg) => {
      errorBox.textContent = msg;
      errorBox.classList.remove('d-none');
    };
    const showSuccess = (msg) => {
      successBox.textContent = msg;
      successBox.classList.remove('d-none');
      setTimeout(() => successBox.classList.add('d-none'), 2000);
    };

    const randomDate = () => {
      const start = new Date(2023, 0, 1);
      const end = new Date();
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const getFilteredTodos = () => {
      const searchVal = document.getElementById('searchInput').value.toLowerCase();
      const from = new Date(document.getElementById('fromDate').value);
      const to = new Date(document.getElementById('toDate').value);
      return todos.filter(todo => {
        const match = todo.todo.toLowerCase().includes(searchVal);
        const date = new Date(todo.date);
        const inRange = (!isNaN(from) ? date >= from : true) && (!isNaN(to) ? date <= to : true);
        return match && inRange;
      });
    };

    const renderTodos = () => {
      const filtered = getFilteredTodos();
      const start = (currentPage - 1) * itemsPerPage;
      const paginated = filtered.slice(start, start + itemsPerPage);
      todoList.innerHTML = '';

      const allCompleted = todos.length && todos.every(t => t.completed);
      const boom = document.getElementById('boomBlast');

      if (allCompleted) {
        boom.style.display = 'block';
        boom.style.animation = 'boomAnimation 1s ease-in-out';
        setTimeout(() => boom.style.display = 'none', 2000);
      }

      if (allCompleted) {
        boom.style.display = 'block';
        boom.style.animation = 'boomAnimation 1s ease-in-out';
        setTimeout(() => boom.style.display = 'none', 2000);

        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
        const celebrate = document.getElementById('celebrateSound');
        celebrate.play();
      }



      paginated.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';

        const left = document.createElement('div');
        left.className = 'd-flex align-items-center gap-2 flex-wrap';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.className = 'form-check-input';
        checkbox.addEventListener('change', () => {
          todo.completed = checkbox.checked;
          renderTodos();
          showSuccess('Task status updated.');
        });

        const text = document.createElement('span');
        const taskDate = new Date(todo.date);
        const today = new Date();
        const dateStr = taskDate.toLocaleDateString();

        if (taskDate < new Date(today.setHours(0, 0, 0, 0))) {
          text.classList.add('text-danger');
        } else if (taskDate.toDateString() === new Date().toDateString()) {
          text.classList.add('text-warning');
        } else {
          text.classList.add('text-success');
        }

        text.textContent = `${todo.todo} (${dateStr})`;
        if (todo.completed) text.classList.add('completed');

        left.appendChild(checkbox);
        left.appendChild(text);

        const actions = document.createElement('div');
        actions.className = 'action-buttons';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-icon edit';
        editBtn.innerHTML = '<i class="bi bi-pencil-square"></i>';
        editBtn.onclick = () => {
          const input = document.createElement('input');
          input.type = 'text';
          input.value = todo.todo;
          input.className = 'form-control form-control-sm';
          input.style.maxWidth = '200px';

          const saveBtn = document.createElement('button');
          saveBtn.className = 'btn-icon save';
          saveBtn.innerHTML = '<i class="bi bi-save"></i>';
          saveBtn.onclick = () => {
            const newText = input.value.trim();
            if (newText) {
              todo.todo = newText;
              renderTodos();
              showSuccess('Task updated.');
            }
          };

          left.innerHTML = '';
          left.appendChild(checkbox);
          left.appendChild(input);
          left.appendChild(saveBtn);
        };

        const delBtn = document.createElement('button');
        delBtn.className = 'btn-icon delete';
        delBtn.innerHTML = '<i class="bi bi-trash3-fill"></i>';
        delBtn.onclick = () => {
          todos = todos.filter(t => t.id !== todo.id);
          renderTodos();
          showSuccess('Task deleted.');
        };

        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        li.appendChild(left);
        li.appendChild(actions);
        todoList.appendChild(li);
      });

      const percent = todos.length ? Math.round(todos.filter(t => t.completed).length / todos.length * 100) : 0;
      const progressBar = document.getElementById('progressBar');
      progressBar.style.width = percent + '%';
      progressBar.innerText = percent + '%';

      renderPagination(filtered.length);
    };

    const renderPagination = (totalItems) => {
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', e => {
          e.preventDefault();
          currentPage = i;
          renderTodos();
        });
        pagination.appendChild(li);
      }
    };

    document.getElementById('searchInput').addEventListener('input', () => {
      currentPage = 1;
      renderTodos();
    });
    document.getElementById('fromDate').addEventListener('change', () => {
      currentPage = 1;
      renderTodos();
    });
    document.getElementById('toDate').addEventListener('change', () => {
      currentPage = 1;
      renderTodos();
    });

    document.getElementById('todoForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('todoTitle').value.trim();
      const date = document.getElementById('todoDate').value;
      if (!title || !date) return;

      try {
        const res = await fetch(`${apiURL}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todo: title, completed: false, userId: 1 })
        });
        const newTodo = await res.json();
        newTodo.date = date;
        todos.unshift(newTodo);
        renderTodos();
        e.target.reset();
        showSuccess('Task added successfully.');
      } catch (err) {
        showError('Failed to add todo.');
      }
    });

    document.getElementById('clearAll').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all tasks?')) {
        todos = [];
        renderTodos();
        showSuccess('All tasks cleared.');
      }
    });

    themeSelect.onchange = () => {
      const theme = themeSelect.value;
      document.documentElement.style.setProperty('--primary-bg', theme === 'dark' ? '#343a40' : '#f8f9fa');
      document.documentElement.style.setProperty('--secondary-bg', theme === 'dark' ? '#495057' : '#dee2e6');
    };

    // Change font family
    document.getElementById('fontSelect').addEventListener('change', (e) => {
      document.documentElement.style.setProperty('--font-family', e.target.value);
    });

    // Change font color
    document.getElementById('fontColor').addEventListener('input', (e) => {
      document.documentElement.style.setProperty('--font-color', e.target.value);
    });


    let allMarked = false;
    document.getElementById('toggleAll').addEventListener('click', () => {
      todos.forEach(todo => todo.completed = !allMarked);
      allMarked = !allMarked;
      renderTodos();
      showSuccess(allMarked ? 'All tasks marked as completed.' : 'All tasks marked as uncompleted.');
    });

    fetchTodos();
    // Unlock audio playback on first user interaction
    document.addEventListener('click', () => {
      const audio = document.getElementById('celebrateSound');
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch((e) => {
        console.warn('Audio pre-unlock failed:', e);
      });
    }, { once: true });
