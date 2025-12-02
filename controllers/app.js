let notes = [];
let noteType = 'text';
let editingId = null;
let listItems = [''];


if (localStorage.getItem("logged") !== "true") {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("logged");
    window.location.href = "login.html";
}

function init() {
    const stored = localStorage.getItem('notes');
    if (stored) {
        try {
            notes = JSON.parse(stored) || [];
        } catch (e) {
            notes = [];
        }
    }
    renderNotes();
}

//tipo nota
function setNoteType(type) {
    noteType = type;

    document.getElementById('textTypeBtn').classList.toggle('active', type === 'text');
    document.getElementById('listTypeBtn').classList.toggle('active', type === 'list');

    document.getElementById('noteContent').classList.toggle('hidden', type !== 'text');
    document.getElementById('listItemsContainer').classList.toggle('hidden', type !== 'list');

    if (type === 'list') {
        renderListItems();
    }
}

//render list items
function renderListItems() {
    const container = document.getElementById('listItemsContainer');
    container.innerHTML = '';

    listItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'list-item-row';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'list-item-input';
        input.placeholder = `Tarea ${index + 1}`;
        input.value = item;
        input.oninput = (e) => updateListItem(index, e.target.value);

        row.appendChild(input);

        if (listItems.length > 1) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-item-btn';
            removeBtn.innerHTML = '✕';
            removeBtn.onclick = () => removeListItem(index);
            row.appendChild(removeBtn);
        }

        container.appendChild(row);
    });

    // Botón agregar
    const addBtn = document.createElement('button');
    addBtn.className = 'add-item-btn';
    addBtn.innerHTML = 'Agregar tarea';
    addBtn.onclick = addListItem;
    container.appendChild(addBtn);
}

//list funtion
function addListItem() {
    listItems.push('');
    renderListItems();
}

function updateListItem(index, value) {
    listItems[index] = value;
}

function removeListItem(index) {
    if (listItems.length > 1) {
        listItems.splice(index, 1);
        renderListItems();
    }
}

//guardar
function saveNote() {
    if (noteType === 'text') {
        const text = document.getElementById('noteContent').value.trim();
        if (!text) {
            alert('La nota está vacía');
            return;
        }
    } else {
        const validItems = listItems.filter(item => item.trim());
        if (validItems.length === 0) {
            alert('Agrega al menos un elemento a la lista');
            return;
        }
    }
    // Crear o editar nota
    if (editingId) {
        notes = notes.map(note => {
            if (note.id === editingId) {
                return {
                    ...note,
                    text: noteType === 'text' ? document.getElementById('noteContent').value : '',
                    type: noteType,
                    items: noteType === 'list' ? listItems.filter(item => item.trim()).map(text => ({ text, completed: false })) : []
                };
            }
            return note;
        });
        editingId = null;
    } else {
        const newNote = {
            id: Date.now(),
            text: noteType === 'text' ? document.getElementById('noteContent').value : '',
            type: noteType,
            items: noteType === 'list' ? listItems.filter(item => item.trim()).map(text => ({ text, completed: false })) : []
        };
        notes.unshift(newNote);
    }

    // Guardar y limpiar
    saveToLocalStorage();
    clearForm();
    renderNotes();
}

//Limpiar
function clearForm() {
    document.getElementById('noteContent').value = '';
    listItems = [''];
    noteType = 'text';
    editingId = null;
    setNoteType('text');
    document.getElementById('saveBtnText').textContent = 'Save note';
}

//check
function toggleListItem(noteId, itemIndex) {
    notes = notes.map(note => {
        if (note.id === noteId) {
            const newItems = (note.items || []).map((item, idx) => {
                if (idx === itemIndex) {
                    return { ...item, completed: !item.completed };
                }
                return item;
            });
            return { ...note, items: newItems };
        }
        return note;
    });
    saveToLocalStorage();
    renderNotes();
}

//Editar
function editNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    editingId = id;
    noteType = note.type;

    if (note.type === 'text') {
        document.getElementById('noteContent').value = note.text || '';
    } else {
        listItems = (note.items || []).map(item => item.text);
    }

    setNoteType(note.type);
    document.getElementById('saveBtnText').textContent = 'Actualizar Nota';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//Delete
function deleteNote(id) {
    if (confirm('¿Eliminar esta nota?')) {
        notes = notes.filter(note => note.id !== id);
        saveToLocalStorage();
        renderNotes();
    }
}

//save
function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

//render notes
function renderNotes() {
    const container = document.getElementById('notesList');
    const countEl = document.getElementById('notesCount');

    countEl.textContent = notes.length;

    if (notes.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <p>No hay notas todavía</p>
                    </div>
                `;
        return;
    }

    container.innerHTML = notes.map(note => {
        const badgeClass = note.type === 'list' ? 'list-type' : 'text-type';
        const badgeText = note.type === 'list' ? 'Lista de Tareas' : 'Nota Simple';
        const badgeIcon = note.type === 'list'
            ? '<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>'
            : '<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';

        let content = '';
        if (note.type === 'text') {
            content = `<p class="note-text">${note.text || ''}</p>`;
        } else {
            const items = (note.items || []).map((item, index) => `
                        <div class="note-list-item ${item.completed ? 'completed' : ''}">
                            <div class="checkbox ${item.completed ? 'checked' : ''}" onclick="toggleListItem(${note.id}, ${index})">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <span>${item.text || ''}</span>
                        </div>
                    `).join('');
            content = `<div class="note-list">${items}</div>`;
        }

        return `
                    <div class="note-card">
                        <div class="note-badge ${badgeClass}">
                            ${badgeIcon}
                            ${badgeText}
                        </div>
                        ${content}
                        <div class="note-actions">
                            <button class="action-btn edit-btn" onclick="editNote(${note.id})">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Editar
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteNote(${note.id})">
                                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Eliminar
                            </button>
                        </div>
                    </div>
                `;
    }).join('');
}
init()