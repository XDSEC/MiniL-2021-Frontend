import { baseURL }  from './config';

function ajax_get(url) {
    return fetch(baseURL + url, {
        method: 'GET',
        credentials: 'include'
    }).then(res=> {
        if(res.status === 200)
            return res.json()
        throw res
    })
}  

function ajax_post(url, data) {
    return fetch(baseURL + url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json', },
        credentials: 'include'
    }).then(res=> {
        if(res.status === 200)
            return res.json()
        throw res
    })
}  

export { ajax_get, ajax_post };