const LOCAL_USERS_KEY = 'localUsers';

export function getLocalUsers() {
    const users = localStorage.getItem(LOCAL_USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveLocalUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

export function addUser(userData) {
    const users = getLocalUsers();

    const maxId = Math.max(0, ...users.filter(u => !isNaN(parseInt(u.id.replace('local-', '')))).map(u => parseInt(u.id.replace('local-', ''))));
    const newId = maxId + 1;
    const newUser = { id: `local-${newId}`, ...userData, todos: [] }; 
    users.push(newUser);
    saveLocalUsers(users);
    return newUser;
}

export function deleteUser(userId) {
    let users = getLocalUsers();
    users = users.filter(user => user.id !== userId);
    saveLocalUsers(users);
}

export function addTodo(userId, todoTitle) {
    const users = getLocalUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        const user = users[userIndex];
        const maxId = Math.max(0, ...user.todos.map(t => t.id || 0)) + 1; 

        const newTodo = {
            id: maxId,
            title: todoTitle,
            completed: false 
        };

        user.todos.push(newTodo);
        saveLocalUsers(users);
        return newTodo;
    }
    return null;
}

export function toggleTodoStatus(userId, todoId) {
    const users = getLocalUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        const user = users[userIndex];
        const todo = user.todos.find(t => t.id === todoId);

        if (todo) {
            todo.completed = !todo.completed; 
            saveLocalUsers(users); 
            return true;
        }
    }
    return false;
}