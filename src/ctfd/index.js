function request(method, url, data) {
    return fetch('/api/v1' + url, {
        method: method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': localStorage.getItem("nonce"),
        },
        credentials: 'include'
    })
}
export default {
    request: request,
    get: url => request('GET', url),
    post: (url, data) => request('POST', url, data)
}
