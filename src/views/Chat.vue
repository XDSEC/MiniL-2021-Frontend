<template>
    <div class="con">
        <meta name="referrer" content="no-referrer" />
        <div class="container">
            <HeadBar></HeadBar>
            <div class="main-container">
                <div class="left-container">
                    <div class="group-container">
                        <div
                            v-if="notice !== null"
                            :key="notice"
                            :class="['talk-item', active == notice ? 'active' : '']"
                            @click="chooseTalk(notice)"
                        >
                            <div class="label">&nbsp;</div>
                            <div class="avatar">
                                <img src="../assets/xdsec.png" />
                            </div>
                            <div class="text">
                                <div class="name">
                                    {{ challs[notice].name }}
                                </div>
                                <div v-if="chat_storage[notice].length > 0">
                                    {{ chat_storage[notice][chat_storage[notice].length - 1].text }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="group-container" v-if="Object.keys(pinned).length !== 0">
                        <div
                            v-for="(res, item) in pinned"
                            :key="item"
                            :class="['labeled', 'talk-item', active == item ? 'active' : '']"
                            @click="chooseTalk(item)"
                        >
                            <div v-if="challs.item !== undefined && pinned[item]">
                                <div class="avatar">
                                    <img :src="challs[item].avatar" />
                                </div>
                                <div class="text">
                                    <div class="name">
                                        {{ challs[item].name }}
                                    </div>
                                    <div v-if="chat_storage[item].length > 0">
                                        {{ chat_storage[item][chat_storage[item].length - 1].text }}
                                    </div>
                                </div>
                                <div class="unread" v-show="cnt_unread[item] != 0">
                                    {{ cnt_unread[item] }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="group-container" v-for="(value, chat_type) in contacts" :key="chat_type">
                        <!-- 生成分组的名字，可点击用于折叠 -->
                        <div v-if="contacts != {}" class="group" @click="collapsed[chat_type] = !collapsed[chat_type]">
                            <div class="group-name">
                                <font-awesome-icon
                                    :icon="!collapsed[chat_type] ? 'chevron-down' : 'chevron-right'"
                                    class="icon"
                                />
                                {{ chat_type.toUpperCase() }}
                                ({{ cnt_done[chat_type] }}/{{ Object.keys(contacts[chat_type]).length }})
                            </div>
                        </div>
                        <!-- 生成会话头像 -->
                        <div v-show="!collapsed[chat_type]" class="group-list" v-if="contacts != {}">
                            <div
                                v-for="(value, index) in contacts[chat_type]"
                                :key="index"
                                :class="['talk-item', active == index ? 'active' : '']"
                                @click="chooseTalk(index)"
                            >
                                <div class="avatar">
                                    <img :src="challs[index].avatar" />
                                </div>
                                <div class="text">
                                    <div class="name">
                                        {{ challs[index].name }}
                                    </div>
                                    <div v-if="challs[index].done === 1">✅</div>
                                    <div v-else-if="chat_storage[index].length > 0">
                                        {{ chat_storage[index].slice(-1).pop().text }}
                                    </div>
                                </div>
                                <div class="unread" v-show="cnt_unread[index] != 0">
                                    {{ cnt_unread[index] }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 生成尚未加载成功的占位内容 -->
                    <div class="group-list" v-if="contacts === {}">
                        <div class="talk-item" v-for="i in 10" :key="i">
                            <div class="avatar">
                                <div class="none-avatar"></div>
                            </div>
                            <div class="text">
                                <div class="none-name"></div>
                                <div class="none-info"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <ChatWindow
                    ref="chat"
                    v-if="active !== null"
                    v-bind:talkList="chat_storage[active]"
                    v-bind:title="challs[active].name"
                    v-bind:muted="challs[active].done"
                    v-on:send_msg="handle_send"
                    v-on:action="handle_action"
                ></ChatWindow>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import HeadBar from '@/components/HeadBar.vue';
import ChatWindow from '@/components/ChatWindow';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { get_avatar } from '../utils';
import ctfd from '../ctfd';

library.add(faChevronRight);
library.add(faChevronDown);

export default {
    components: {
        HeadBar,
        ChatWindow
    },
    data() {
        return {
            persisted: [
                'chat_storage',
                'challs',
                'contacts',
                'pinned',
                'cnt_unread',
                'cnt_done',
                'collapsed',
                'notice'
            ],
            //当前激活的会话
            active: null,
            //聊天记录
            chat_storage: {},
            //计时器id
            timer: '',
            //会话分组列表
            collapsed: {},
            //服务器返回的原始数据
            challs: {},
            //左边的会话列表
            contacts: {},
            pinned: {},
            //题目的完成进度
            cnt_done: {},
            //未读消息数
            cnt_unread: {},
            //公告的id
            notice: null,
            //注册表
            func_registry: {}
        };
    },
    methods: {
        initialize(type, id, name) {
            var obj = { name: name, id: id, type: type };
            obj.hash = type.charAt(0) + id;
            if (this.challs[obj.hash] !== undefined) return;
            obj.avatar = get_avatar(id);
            this.challs[obj.hash] = obj;
            this.contacts[type].push(obj.hash);
            Vue.set(this.chat_storage, obj.hash, []);
            Vue.set(this.cnt_unread, obj.hash, 0);
        },
        chooseTalk(id) {
            this.cnt_unread[id] = 0;
            this.active = id;
            for (let type in this.contacts) {
                if (this.pinned[id] || this.challs[id].category.toLowerCase() != type) this.collapsed[type] = true;
            }
            this.updateHints(id);
        },
        recv(msg) {
            if (this.active) this.handle_recv(this.active, msg);
        },
        handle_send(msg) {
            this.$refs.chat.send(msg);
            if (this.func_registry[msg] !== undefined) {
                this.func_registry[msg]();
                return;
            }
            ctfd.post('/challenges/attempt', {
                challenge_id: this.challs[this.active].id,
                submission: msg
            })
                .then((resp) => resp.json())
                .then((resp) => {
                    if (resp.success == true) return resp.data;
                    throw resp;
                })
                .catch((error) => console.log(error))
                .then((resp) => {
                    this.recv(resp.message);
                    if (resp.status == 'correct') {
                        var category = this.challs[this.active].category.toLowerCase();
                        this.contacts[category][this.active].done = 1;
                        Vue.set(this.challs[this.active], 'done', 1);
                        Vue.set(this.cnt_done, category, this.cnt_done[category] + 1);
                    }
                });
        },
        handle_recv(id, message) {
            if (this.challs[id] === undefined) this.initialize(id, '');
            if (this.active === id) this.$refs.chat.recv(message, this.challs[id].avatar);
            else {
                this.chat_storage[id].push({
                    avatar: this.challs[id].avatar,
                    text: message,
                    is_send: false
                });
                if (this.active !== id) this.cnt_unread[id] += 1;
            }
            this.cache();
        },
        handle_action(action) {
            switch (action) {
                case 'pin':
                    if (this.pinned[this.active] === undefined) Vue.set(this.pinned, this.active, true);
                    else Vue.set(this.pinned, this.active, !this.pinned[this.active]);
                    break;
            }
            this.cache();
        },
        generateList(challenges, solved) {
            if (challenges.length != this.challs.length) {
                var has_active = false;
                for (let i in challenges) {
                    if (challenges[i].id == this.active) {
                        has_active = true;
                        break;
                    }
                }
                if (!has_active) this.active = null;
                this.challs = {};
                this.contacts = {};
            }
            for (let i in challenges) {
                var id = challenges[i].id;
                this.challs[id] = challenges[i];
                let type = challenges[i].category.toLowerCase();
                var avatar_url = challenges[i].name.match(/(.*)\[(.*)\]/);
                if (avatar_url !== null) {
                    challenges[i].name = avatar_url[1];
                    challenges[i].avatar = isNaN(avatar_url[2]) ? avatar_url[2] : this.get_avatar(avatar_url[2]);
                }
                if (this.chat_storage[id] === undefined) {
                    Vue.set(this.chat_storage, id, []);
                    Vue.set(this.cnt_unread, id, 0);
                }
                let recvd_cnt = this.chat_storage[id].filter((o) => o.is_send === false).length;
                var cnt_new = challenges[i].hints + challenges[i].files - recvd_cnt + 1;
                if (cnt_new > 0) this.updateHints(id);
                if (type === 'notice') {
                    this.notice = id;
                    continue;
                }
                challenges[i].done = solved[challenges[i].id] ? 1 : 0;
                if (challenges[i].done) this.cnt_unread[id] = 0;
                if (this.collapsed[type] === undefined) Vue.set(this.collapsed, type, false);
                if (this.contacts[type] === undefined) Vue.set(this.contacts, type, {});
                Vue.set(this.contacts[type], id, challenges[i]);
            }
            //重新计算答题进度
            for (let i in this.contacts) {
                let done = 0;
                for (let j in this.contacts[i]) {
                    if (this.contacts[i][j].done === 1) done++;
                }
                Vue.set(this.cnt_done, i, done);
            }
        },
        async getChallenges() {
            try {
                var challs = await ctfd.get('/challenges');
                challs = await challs.json();
                if (challs.success) challs = challs.data;
                else throw challs;
                var resp = await ctfd.get('/users/me/solves');
                resp = await resp.json();
                var solved = {};
                if (resp.success !== true) throw resp;
                for (var i of resp.data) solved[i.challenge_id] = true;
                this.generateList(challs, solved);
            } catch (error) {
                // alert("请重新登陆");
                console.log(error);
                // localStorage.clear();
                // this.$router.push("/login");
            }
        },
        async updateChallenge(index) {
            try {
                var chall = await (await ctfd.get('/challenges/' + this.challs[index].id)).json();
                if (chall.success !== true) throw chall;
                else chall = chall.data;
                chall.done = this.challs[index].done;
                var avatar_url = chall.name.match(/\[.*\]/g);
                if (avatar_url !== null) {
                    chall.name = chall.name.replace(/\[.*\]/g, '');
                    var avatar = avatar_url[0].replace(/\[(.*)\]/g, '$1');
                    chall.avatar = isNaN(avatar) ? avatar : this.get_avatar(avatar);
                }
                Vue.set(this.challs, index, chall);
                return chall;
            } catch (err) {
                console.log(err);
                return null;
            }
        },
        async updateHints(index) {
            var chall = await this.updateChallenge(index);
            if (chall === null) return;
            var cnt_hints = chall.hints.length;
            if (this.chat_storage[index].length === 0) {
                this.handle_recv(index, chall.description);
                for (let h of chall.files)
                    this.handle_recv(index, `下载文件: [${h.split('/').slice(-1).pop().split('?')[0]}](${h})`);
            }
            var total = this.chat_storage[index].filter((o) => o.is_send === false).length;
            var hint_start = total - chall.files.length - 1;
            if (hint_start < cnt_hints) {
                for (let h = hint_start; h < cnt_hints; h++) {
                    var res = await (await ctfd.get('/hints/' + chall.hints[h].id)).json();
                    this.handle_recv(index, res.data.content);
                }
            }
            this.cache();
        },
        cache() {
            for (var key of this.persisted) {
                localStorage.setItem(key, JSON.stringify(this[key]));
            }
        }
    },
    created() {
        ctfd.get('/users/me')
            .then((resp) => resp.json())
            .then((resp) => localStorage.setItem('email', resp.data.email));
        for (var key of this.persisted) {
            var val = JSON.parse(localStorage.getItem(key));
            if (val !== null) {
                Vue.set(this, key, val);
            }
        }

        this.getChallenges();
        this.timer = setInterval(() => {
            if (this.active !== null) this.updateChallenge(this.active);
            this.getChallenges();
            this.cache();
        }, 30000);
        var docker_request = async (method) => {
            var url = '/plugins/ctfd-whale/container?challenge_id=' + this.challs[this.active].id;
            let res = await ctfd.request(method, url);
            return await res.json();
        };
        this.func_registry = {
            查询分值: async () => this.recv(`当前题目分值${(await this.updateChallenge(this.active)).value}`),
            获取环境: async () => {
                if (this.challs[this.active].type !== 'dynamic_docker') return await this.recv('本题莫得docker环境');
                try {
                    var chall = await docker_request('GET');
                    if (!chall.success) {
                        this.recv(chall.message);
                        return;
                    }
                    if (chall.data.remaining_time === undefined) {
                        await docker_request('POST');
                        this.recv('成功获取题目环境。');
                        this.recv('注意：同一账户同时只能开启同一题目，请注意合理安排做题时间。');
                        chall = await docker_request('GET');
                    }
                    this.recv(`${chall.data.user_access}\n剩余时间：${chall.data.remaining_time}秒。`);
                } catch (err) {
                    // this.recv((await err.json()).message);
                    console.log(err);
                }
            },
            延长时限: async () => {
                if (this.challs[this.active].type !== 'dynamic_docker') return await this.recv('本题莫得docker环境');
                try {
                    let chall = await docker_request('PATCH');
                    if (!chall.success) {
                        this.recv(chall.message);
                        return;
                    }
                    this.recv('延长时限成功');
                } catch (err) {
                    console.log(err);
                }
            },
            销毁环境: async () => {
                if (this.challs[this.active].type !== 'dynamic_docker') return await this.recv('本题莫得docker环境');
                try {
                    let chall = await docker_request('DELETE');
                    if (chall.success) this.recv('销毁环境成功');
                    else this.recv(chall.message);
                } catch (err) {
                    this.recv((await err.json()).message);
                    console.log(err);
                }
            },
            重置环境: async () => {
                if (this.challs[this.active].type !== 'dynamic_docker') return await this.recv('本题莫得docker环境');
                try {
                    await docker_request('POST');
                    this.recv('成功重置题目环境。');
                    await this.func_registry.获取环境();
                } catch (err) {
                    console.log(err);
                }
            },
            一键锤爆出题人: () => {
                var avatar = this.challs[this.active].avatar;
                var match = avatar.match(/https:\/\/q1\.qlogo\.cn\/g\?b=qq&nk=([0-9]*)&s=640/);
                console.log(match);
                if (match === null) this.recv(`锤不到（`);
                else this.recv(`出题人QQ: ${match[1]}`);
            }
        };
    },
    beforeDestroy() {
        //缓存
        this.cache();
        //销毁计数器
        clearInterval(this.timer);
    }
};
</script>

<style scoped>
.main-container {
    height: calc(100% - 50px);
    max-height: 95%;
    width: 100%;
    display: flex;
    justify-content: left;
    align-items: center;
    background: transparent;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.left-container {
    height: 100%;
    width: 300px;
    box-sizing: border-box;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
    background: rgba(255, 255, 255, 0.15);
    overflow-y: scroll;
    color: white;
}
.left-container::-webkit-scrollbar {
    width: 0px;
}
.group-container {
    min-height: 30px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
.group {
    height: 30px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    cursor: pointer;
}
.group-name {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
}
.group-name .icon {
    margin: 0 10px;
}
.group-number {
    margin-right: 10px;
}
.group-list {
    width: 100%;
}
.unread {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 10px;
    margin: auto;
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: rgb(239, 59, 57);
    color: white;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
}
.talk-item {
    height: 70px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    position: relative;
}
.talk-item.active {
    background: rgba(88, 88, 88, 0.6);
}
.talk-item .avatar {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    margin: 0 5px 0 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
}
.none-avatar {
    height: 40px;
    width: 40px;
    border-radius: 50%;
    background: rgb(201, 201, 201);
}
.none-name,
.none-info {
    width: 100%;
    margin: 2px;
    background: rgb(201, 201, 201);
}
.none-name {
    height: 20px;
    margin-bottom: 5px;
}
.none-info {
    height: 15px;
}
.talk-item.disable {
    color: rgb(182, 182, 182);
}
.talk-item.disable .avatar {
    filter: grayscale(100%);
}
.avatar img {
    height: 100%;
    width: 100%;
}
.talk-item .text {
    height: 40px;
    width: 60%;
    margin: 0 10px 0 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 12px;
    overflow: hidden;
}
.text div {
    margin: 0;
    text-align: left;
    line-height: 20px;
}
.text .name {
    font-size: 16px;
    width: 100%;
    white-space: nowrap;
}
.label {
    font-size: 4px;
    line-height: 3em;
    width: 6em;
    background: #ffffff;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    -webkit-transform-origin: right bottom;
    -moz-transform-origin: right bottom;
    transform-origin: right bottom;
    -webkit-transform: translate(-29.29%, -100%) rotate(-45deg);
    -moz-transform: translate(-29.29%, -100%) rotate(-45deg);
    transform: translate(-29.29%, -100%) rotate(-45deg);
    text-indent: 0;
    text-align: center;
}
</style>