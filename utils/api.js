const BASE_URL = 'https://jsonplaceholder.typicode.com';

export async function fetchUsers() {
    const response = await fetch(`${BASE_URL}/users`);
    return response.json();
}

export async function fetchTodos() {
    const response = await fetch(`${BASE_URL}/todos`);
    return response.json();
}

///////////////////////////////////////////////////

export async function fetchPosts(userId) {
    const url = userId ? `${BASE_URL}/posts?userId=${userId}` : `${BASE_URL}/posts`;
    const response = await fetch(url);
    return response.json();
}

export async function fetchComments(postId) {
    const url = postId ? `${BASE_URL}/comments?postId=${postId}` : `${BASE_URL}/comments`;
    const response = await fetch(url);
    return response.json();
}