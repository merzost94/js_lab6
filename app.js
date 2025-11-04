import { ROUTES } from './data/routes.js';
import { createElement } from './utils/createComponent.js';
import { fetchUsers, fetchTodos, fetchPosts, fetchComments } from './utils/api.js';
import { debounce } from './utils/debounce.js';
import { getLocalUsers, addUser, deleteUser } from './utils/localStore.js';

const appRoot = document.getElementById('app');

function renderTodos(queryString) { appRoot.innerHTML = '<h2>Todos (TBD)</h2>'; }
function renderPosts(queryString) { appRoot.innerHTML = '<h2>Посты (TBD)</h2>'; }
function renderComments(queryString) { appRoot.innerHTML = '<h2>Комментарии (TBD)</h2>'; }


const routeHandlers = {
    '#users': renderUsers,
    '#users#todos': renderTodos,
    '#users#posts': renderPosts,
    '#users#posts#comments': renderComments
};

function handleRouting() {
    const fullHash = window.location.hash || '#users';
    const [hash, queryString] = fullHash.split('?');
    const handler = routeHandlers[hash];

    if (handler) {
        appRoot.innerHTML = ''; 
        handler(queryString); 
    } else {
        appRoot.innerHTML = '<h2>404</h2><p>Перейдите на <a href="#users">#users</a></p>';
    }
}


async function renderUsers(queryString) {
    const rawUsers = await fetchUsers(); 
    const allUsers = [...rawUsers, ...getLocalUsers()];
    let users = allUsers; 
    
    const userListContainer = createElement('div', { class: 'user-list' });

    const renderUserList = (data) => {
        userListContainer.innerHTML = ''; 
        data.forEach(user => {
            const isLocal = typeof user.id === 'string' && user.id.startsWith('local-');

            const deleteBtn = isLocal ? createElement('button', {
                onclick: () => {
                    deleteUser(user.id);
                    handleRouting();
                },
                class: 'delete-btn'
            }, ['Удалить']) : createElement('span', {}, ['(API)']);
            
            const userCard = createElement('div', { class: 'user-card' }, [
                createElement('h3', { 
                    onclick: () => window.location.hash = `#users#posts?userId=${user.id}`
                }, [user.name]),
                createElement('p', {}, [`Email: ${user.email}`]),
                deleteBtn
            ]);
            userListContainer.appendChild(userCard);
        });
    };
    
    const handleSearchInput = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        users = allUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) || 
            user.email.toLowerCase().includes(searchTerm)
        );
        renderUserList(users); 
    };

    const debouncedSearch = debounce(handleSearchInput, 300);

    const searchInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Искать по имени или email...',
        oninput: debouncedSearch
    });
    
    const form = createElement('form', { 
        onsubmit: (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newName = formData.get('name');
            const newEmail = formData.get('email');
            
            if (newName && newEmail) {
                addUser({ name: newName, email: newEmail });
                handleRouting(); 
            }
        }
    }, [
        createElement('input', { type: 'text', name: 'name', placeholder: 'Имя', required: true }),
        createElement('input', { type: 'email', name: 'email', placeholder: 'Email', required: true }),
        createElement('button', { type: 'submit' }, ['Добавить пользователя'])
    ]);

    appRoot.appendChild(createElement('div', { class: 'header-controls' }, [
        createElement('h1', {}, ['Пользователи']), 
        searchInput
    ]));
    appRoot.appendChild(form); 
    appRoot.appendChild(userListContainer);
    
    renderUserList(users); 
}


window.addEventListener('load', handleRouting);
window.addEventListener('hashchange', handleRouting);