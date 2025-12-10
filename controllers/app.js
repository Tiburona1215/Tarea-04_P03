let notes = [];
let noteType = 'text';
let editingId = null;
let listItems = [''];
let currentTypeFilter = 'all';
let currentSearchTerm = '';
let currentTagFilter = null;

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
    loadThemes();
    renderNotes();
    updateTagFilters();
    updateSuggestedTags();
}

function loadThemes() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}
function updateThemeIcon(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
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

    const tagsInput = document.getElementById('tagsInput').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    if (editingId) {
        notes = notes.map(note => {
            if (note.id === editingId) {
                return {
                    ...note,
                    text: noteType === 'text' ? document.getElementById('noteContent').value : '',
                    type: noteType,
                    items: noteType === 'list' ? listItems.filter(item => item.trim()).map(text => ({ text, completed: false })) : [],
                    tags: tags,
                    favorite: note.favorite || false
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
            items: noteType === 'list' ? listItems.filter(item => item.trim()).map(text => ({ text, completed: false })) : [],
            tags: tags,
            favorite: false
        };
        notes.unshift(newNote);
    }

    saveToLocalStorage();
    clearForm();
    renderNotes();
    updateTagFilters();
    updateSuggestedTags();
}

//Limpiar
function clearForm() {
    document.getElementById('noteContent').value = '';
    document.getElementById('tagsInput').value = '';
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

function toggleFavorite(id, event) {
    event.stopPropagation();
    notes = notes.map(note => {
        if (note.id === id) {
            return { ...note, favorite: !note.favorite };
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
    document.getElementById('tagsInput').value = (note.tags || []).join(', ');

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
        updateTagFilters();
        updateSuggestedTags();
    }
}

//save
function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function setTypeFilter(filter) {
    currentTypeFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

    applyFilters();
}

function setTagFilter(tag) {
    if (currentTagFilter === tag) {
        currentTagFilter = null;
    } else {
        currentTagFilter = tag;
    }
    updateTagFilters();
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    currentSearchTerm = searchTerm;

    let filteredNotes = [...notes];

    if (currentTypeFilter === 'text') {
        filteredNotes = filteredNotes.filter(note => note.type === 'text');
    } else if (currentTypeFilter === 'list') {
        filteredNotes = filteredNotes.filter(note => note.type === 'list');
    } else if (currentTypeFilter === 'favorites') {
        filteredNotes = filteredNotes.filter(note => note.favorite);
    }

    if (currentTagFilter) {
        filteredNotes = filteredNotes.filter(note =>
            note.tags && note.tags.includes(currentTagFilter)
        );
    }

    if (searchTerm) {
        filteredNotes = filteredNotes.filter(note => {

            if (note.type === 'text' && note.text.toLowerCase().includes(searchTerm)) {
                return true;
            }

            if (note.type === 'list') {
                return note.items.some(item => item.text.toLowerCase().includes(searchTerm));
            }

            if (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
                return true;
            }
            return false;
        });
    }

    renderFilteredNotes(filteredNotes);
}

function renderFilteredNotes(filteredNotes) {
    const container = document.getElementById('notesList');
    const countEl = document.getElementById('notesCount');

    countEl.textContent = filteredNotes.length;

    if (filteredNotes.length === 0) {
        const message = currentSearchTerm ?
            'No se encontraron notas con ese criterio' :
            'No hay notas todavía';
        container.innerHTML = `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
        return;
    }

    const sortedNotes = [...filteredNotes].sort((a, b) => {
        if (a.favorite && !b.favorite) return -1;
        if (!a.favorite && b.favorite) return 1;
        return 0;
    });

    container.innerHTML = sortedNotes.map(note => generateNoteHTML(note)).join('');
}

//render notes
function renderNotes() {
    currentTypeFilter = "all";  
    currentTagFilter = null;
    currentSearchTerm = "";
    applyFilters();
}

function generateNoteHTML(note) {
    const badgeClass = note.type === 'list' ? 'list-type' : 'text-type';
    const badgeText = note.type === 'list' ? 'Lista de Tareas' : 'Nota Simple';
    const badgeIcon = note.type === 'list'
        ? '<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>'
        : '<svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';

    const favoriteIcon = note.favorite
        ? '<svg class="favorite-icon active" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
        : '<svg class="favorite-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>';

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

    let tagsHTML = '';
    if (note.tags && note.tags.length > 0) {
        tagsHTML = `
            <div class="note-tags">
                ${note.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
    }

    return `
        <div class="note-card">
            <div class="note-header-row">
                <div class="note-badge ${badgeClass}">
                    ${badgeIcon}
                    ${badgeText}
                </div>
                <button class="favorite-btn" onclick="toggleFavorite(${note.id}, event)">
                    ${favoriteIcon}
                </button>
            </div>
            ${content}
            ${tagsHTML}
            <div class="note-actions">
                <button class="action-btn edit-btn" onclick="editNote(${note.id})">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                    Editar
                </button>
                <button class="action-btn export-btn" onclick="exportNote(${note.id})">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    Exportar
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
}

function exportNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    let content = '';
    const date = new Date().toISOString().split('T')[0];

    if (note.type === 'text') {
        content = `NOTA\n`;
        content += `Fecha de exportación: ${date}\n`;
        content += `${'_'.repeat(50)}\n\n`;
        content += note.text;
    } else {
        content = `LISTA DE TAREAS\n`;
        content += `Fecha de exportación: ${date}\n`;
        content += `${'_'.repeat(50)}\n\n`;
        note.items.forEach((item, index) => {
            const status = item.completed ? '[✓]' : '[ ]';
            content += `${index + 1}. ${status} ${item.text}\n`;
        });
    }

    if (note.tags && note.tags.length > 0) {
        content += `\n\nEtiquetas: ${note.tags.join(', ')}`;
    }

    if (note.favorite) {
        content += `\n⭐ Nota marcada como favorita`;
    }

    downloadTextFile(content, `nota-${note.id}-${date}.txt`);
}

function exportAllNotes() {
    if (notes.length === 0) {
        alert('No hay notas para exportar');
        return;
    }

    const date = new Date().toISOString().split('T')[0];
    let content = `MIS NOTAS - Exportación completa\n`;
    content += `Fecha: ${date}\n`;
    content += `Total de notas: ${notes.length}\n`;
    content += `${'='.repeat(70)}\n\n`;

    notes.forEach((note, index) => {
        content += `\n${'─'.repeat(70)}\n`;
        content += `NOTA ${index + 1} - ${note.type === 'text' ? 'Nota Simple' : 'Lista de Tareas'}`;
        if (note.favorite) content += ' ⭐';
        content += `\n${'─'.repeat(70)}\n\n`;

        if (note.type === 'text') {
            content += note.text;
        } else {
            note.items.forEach((item, i) => {
                const status = item.completed ? '[✓]' : '[ ]';
                content += `${i + 1}. ${status} ${item.text}\n`;
            });
        }

        if (note.tags && note.tags.length > 0) {
            content += `\nEtiquetas: ${note.tags.join(', ')}`;
        }
        content += '\n';
    });

    downloadTextFile(content, `todas-mis-notas-${date}.txt`);
}

function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

function updateSuggestedTags() {
    const allTags = new Set();
    notes.forEach(note => {
        if (note.tags) {
            note.tags.forEach(tag => allTags.add(tag));
        }
    });

    const container = document.getElementById('suggestedTags');
    if (allTags.size === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="suggested-tags-label">Etiquetas existentes:</div>
        ${Array.from(allTags).map(tag => 
            `<span class="suggested-tag" onclick="addTagToInput('${tag}')">${tag}</span>`
        ).join('')}
    `;
}

function addTagToInput(tag) {
    const input = document.getElementById('tagsInput');
    const currentTags = input.value.split(',').map(t => t.trim()).filter(t => t);
    if (!currentTags.includes(tag)) {
        currentTags.push(tag);
        input.value = currentTags.join(', ');
    }
}

function updateTagFilters() {
    const allTags = new Set();
    notes.forEach(note => {
        if (note.tags) {
            note.tags.forEach(tag => allTags.add(tag));
        }
    });

    const container = document.getElementById('tagFilterContainer');
    if (allTags.size === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="tag-filters-label">Filtrar por etiqueta:</div>
        <div class="tag-filters">
            ${Array.from(allTags).map(tag => 
                `<button class="tag-filter-btn ${currentTagFilter === tag ? 'active' : ''}" onclick="setTagFilter('${tag}')">
                    ${tag}
                </button>`
            ).join('')}
        </div>
    `;
}

init()
