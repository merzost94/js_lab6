import { ROUTES } from './data/routes.js';

const appRoot = document.getElementById('app');

function renderUsers(queryString) { appRoot.innerHTML = '<header>Загрузка...</header><h2>Пользователи</h2>'; }
function renderTodos(queryString) { appRoot.innerHTML = '<header>Загрузка...</header><h2>Todos</h2>'; }
function renderPosts(queryString) { appRoot.innerHTML = '<header>Загрузка...</header><h2>Посты</h2>'; }
function renderComments(queryString) { appRoot.innerHTML = '<header>Загрузка...</header><h2>Комментарии</h2>'; }

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

window.addEventListener('load', handleRouting);
window.addEventListener('hashchange', handleRouting);