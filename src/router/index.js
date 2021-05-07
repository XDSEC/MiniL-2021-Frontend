import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/views/Login'
import Chat from '@/views/Chat'
import Contacts from '@/views/Contacts'
import Options from '@/views/Options'

Vue.use(Router)

var router = new Router({
    mode: process.env.IS_ELECTRON ? 'hash' : 'history',
    routes: [
        {
            path: '/',
            redirect: '/login',
        }, {
            path: '/login',
            name: 'Login',
            component: Login,
        }, {
            path: '/challenges',
            name: 'Challenges',
            component: Chat
        }, {
            path: '/team/:id',
            name: 'Team',
            component: Contacts,
        }, {
            path: '/board',
            name: 'Board',
            component: Options,
        },
    ]
})

router.beforeEach((to, from, next) => {
    let nonce = localStorage.getItem('nonce');
    let needIdList = ['Challenges', 'Team', 'Board'];
    if (nonce === null && needIdList.indexOf(to.name) !== -1)
        next({ path: '/login' })
    else if (nonce !== null && to.name === 'Login')
        next({ path: '/challenges' })
    else next()
})

export default router;
