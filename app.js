const STORAGE_KEY = 'todo-dom-demo';
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [
  {id: genId(), title: 'Comprar leche', completed: false},
  {id: genId(), title: 'Revisar correo', completed: true},
];

const refs = {
  form: document.querySelector('#taskForm'),
  input: document.querySelector('#taskInput'),
  list: document.querySelector('#taskList'),
  counter: document.querySelector('#counter'),
  filterBtns: document.querySelectorAll('.filter-btn')
};

let currentFilter = 'all';

function render(){
  refs.list.innerHTML = '';
  const frag = document.createDocumentFragment();
  const visible = tasks.filter(t => {
    if(currentFilter === 'active') return !t.completed;
    if(currentFilter === 'completed') return t.completed;
    return true;
  });
  visible.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task';
    if(t.completed) li.classList.add('completed');
    li.dataset.id = t.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.completed;
    checkbox.setAttribute('aria-label', 'Marcar tarea completada');

    const span = document.createElement('span');
    span.className = 'task-title';
    span.textContent = t.title;
    span.tabIndex = 0;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'edit-btn';
    editBtn.setAttribute('aria-label','Editar tarea');
    editBtn.textContent = '✏️';

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'del-btn';
    delBtn.setAttribute('aria-label','Eliminar tarea');
    delBtn.textContent = '🗑️';

    actions.append(editBtn, delBtn);
    li.append(checkbox, span, actions);
    frag.appendChild(li);
  });
  refs.list.appendChild(frag);
  updateCounter();
  persist();
}

function persist(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function updateCounter(){
  const pendientes = tasks.filter(t => !t.completed).length;
  refs.counter.textContent = pendientes + (pendientes === 1 ? ' tarea pendiente' : ' tareas pendientes');
}

function genId(){
  return 't_' + Math.random().toString(36).slice(2,9);
}

refs.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = refs.input.value.trim();
  if(!value){
    refs.input.focus();
    refs.input.setAttribute('aria-invalid','true');
    return;
  }
  refs.input.removeAttribute('aria-invalid');
  const newTask = {id: genId(), title: value, completed: false};
  tasks.unshift(newTask);
  refs.input.value = '';
  render();
});

refs.list.addEventListener('click', (e) => {
  const li = e.target.closest('li.task');
  if(!li) return;
  const id = li.dataset.id;
  if(e.target.type === 'checkbox'){
    toggleComplete(id, e.target.checked);
    return;
  }
  if(e.target.classList.contains('edit-btn')){
    startEdit(li, id);
    return;
  }
  if(e.target.classList.contains('del-btn')){
    deleteTask(id);
    return;
  }
});

refs.list.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    const li = e.target.closest('li.task');
    if(li && e.target.classList.contains('task-title')){
      startEdit(li, li.dataset.id);
    }
  }
});

function toggleComplete(id, checked){
  const t = tasks.find(x => x.id === id);
  if(!t) return;
  t.completed = !!checked;
  render();
}

function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  render();
}

function startEdit(li, id){
  const task = tasks.find(t => t.id === id);
  if(!task) return;
  const titleEl = li.querySelector('.task-title');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.title;
  input.className = 'editing-input';
  input.setAttribute('aria-label','Editar título de tarea');
  titleEl.replaceWith(input);
  input.focus();
  function finish(ok){
    if(ok){
      const val = input.value.trim();
      if(val){
        task.title = val;
      }
    }
    const span = document.createElement('span');
    span.className = 'task-title';
    span.textContent = task.title;
    span.tabIndex = 0;
    input.replaceWith(span);
    render();
  }
  input.addEventListener('blur', () => finish(true));
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') finish(true);
    if(e.key === 'Escape') finish(false);
  });
}

refs.filterBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    refs.filterBtns.forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    refs.filterBtns.forEach((b) => b.setAttribute('aria-selected', b.classList.contains('active')));
    currentFilter = e.currentTarget.dataset.filter;
    render();
  });
});

render();
