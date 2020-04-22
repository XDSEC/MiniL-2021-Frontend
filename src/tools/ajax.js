import { baseURL }  from './config';

function ajax_get(url) {
    return fetch(baseURL + url, {
        method: 'GET',
        credentials: 'include'
    }).then(res=>res.json())
}  

function ajax_post(url, data) {
    return fetch(baseURL + url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', },
        credentials: 'include'
    }).then(res=>res.json())
}  

export { ajax_get, ajax_post };