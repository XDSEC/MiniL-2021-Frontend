import { baseURL }  from './config';

function ajax_get(url) {
    return fetch(baseURL + url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
        credentials: 'include'
    })
}  

function ajax_post(url, data) {
    let form = new URLSearchParams();
    for (name in data) {
        form.append(name, data[name]);
    }
    return fetch(baseURL + url, {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
        credentials: 'include'
    })
}  

export { ajax_get, ajax_post };