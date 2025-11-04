import { ROUTES } from './data/routes.js';
import { createElement } from './utils/createComponent.js';
import { fetchUsers, fetchTodos, fetchPosts, fetchComments } from './utils/api.js';
import { debounce } from './utils/debounce.js';
import { getLocalUsers, addUser, deleteUser } from './utils/localStore.js';
import { renderBreadcrumbs } from './components/Breadcrumbs.js'; 

const appRoot = document.getElementById('app');


async function renderTodos(queryString) {
    const rawTodos = await fetchTodos();
    const localUsers = getLocalUsers();
    
    const localTodos = localUsers.flatMap(user => 
        (user.todos || []).map(todo => ({
            ...todo, 
            userId: user.id, 
            title: `[LOCAL] ${todo.title}`,
            id: todo.id 
        }))
    );
    const allTodos = [...rawTodos, ...localTodos]; 
    let todos = allTodos;
    
    const todoListContainer = createElement('div', { class: 'todo-list' });

    const handleSearchInput = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        todos = allTodos.filter(todo => 
            todo.title.toLowerCase().includes(searchTerm)
        );
        renderTodoList(todos);
    };
    const searchInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Искать по title...',
        oninput: debounce(handleSearchInput, 300)
    });

    const renderTodoList = (data) => {
        todoListContainer.innerHTML = '';
        data.forEach(todo => {
            const status = todo.completed ? 'completed' : 'pending';
            const todoItem = createElement('div', { class: `todo-item ${status}` }, [
                createElement('p', {}, [todo.title]),
                createElement('span', {}, [status])
            ]);
            todoListContainer.appendChild(todoItem);
        });
    };
    
    appRoot.appendChild(createElement('div', { class: 'header-controls' }, [
        createElement('h1', {}, ['Все Todos']),
        searchInput
    ]));
    appRoot.appendChild(todoListContainer);
    renderTodoList(todos);
}

async function renderPosts(queryString) {
    const params = new URLSearchParams(queryString);
    const userId = params.get('userId');
    const title = userId ? `Посты пользователя ${userId}` : 'Все посты';
    
    const rawPosts = await fetchPosts(userId);
    let posts = rawPosts;

    const postListContainer = createElement('div', { class: 'post-list' });

    const handleSearchInput = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        posts = rawPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.body.toLowerCase().includes(searchTerm)
        );
        renderPostList(posts);
    };
    const searchInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Искать по title или body...',
        oninput: debounce(handleSearchInput, 300)
    });
    
    const renderPostList = (data) => {
        postListContainer.innerHTML = '';
        data.forEach(post => {
            const postCard = createElement('div', { class: 'post-card' }, [
                createElement('h3', { 
                    onclick: () => window.location.hash = `#users#posts#comments?postId=${post.id}` 
                }, [post.title]),
                createElement('p', {}, [post.body])
            ]);
            postListContainer.appendChild(postCard);
        });
    };

    appRoot.appendChild(createElement('div', { class: 'header-controls' }, [
        createElement('h1', {}, [title]),
        searchInput
    ]));
    appRoot.appendChild(postListContainer);
    renderPostList(posts);
}


async function renderComments(queryString) {
    const params = new URLSearchParams(queryString);
    const postId = params.get('postId');
    const title = postId ? `Комментарии к посту ${postId}` : 'Все комментарии';
    
    const rawComments = await fetchComments(postId);
    let comments = rawComments;

    const commentListContainer = createElement('div', { class: 'comment-list' });

    const handleSearchInput = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        comments = rawComments.filter(comment => 
            comment.name.toLowerCase().includes(searchTerm) || 
            comment.body.toLowerCase().includes(searchTerm)
        );
        renderCommentList(comments);
    };
    const searchInput = createElement('input', { 
        type: 'text', 
        placeholder: 'Искать по name или body...',
        oninput: debounce(handleSearchInput, 300)
    });

    const renderCommentList = (data) => {
        commentListContainer.innerHTML = '';
        data.forEach(comment => {
            const commentCard = createElement('div', { class: 'comment-card' }, [
                createElement('h4', {}, [comment.name]),
                createElement('p', {}, [comment.body])
            ]);
            commentListContainer.appendChild(commentCard);
        });
    };
    
    appRoot.appendChild(createElement('div', { class: 'header-controls' }, [
        createElement('h1', {}, [title]),
        searchInput
    ]));
    appRoot.appendChild(commentListContainer);
    renderCommentList(comments);
}


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
        const breadcrumbs = renderBreadcrumbs(hash);
        appRoot.appendChild(breadcrumbs);
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