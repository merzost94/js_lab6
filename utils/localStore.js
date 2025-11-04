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