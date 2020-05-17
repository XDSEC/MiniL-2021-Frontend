<template>
    <div class="con">
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
                                <img src="../../static/images/xdsec.png" />
                            </div>
                            <div class="text">
                                <div class="name">{{challs[notice].name}}</div>
                                <div
                                    v-if="chat_storage[notice].length > 0"
                                >{{chat_storage[notice][chat_storage[notice].length - 1].text}}</div>
                            </div>
                            <div
                                class="unread"
                                v-show="cnt_unread[notice] != 0"
                            >{{cnt_unread[notice]}}</div>
                        </div>
                    </div>

                    <div
                        class="group-container"
                        v-for="(value, key) in catagorized_challs"
                        :key="key"
                        v-if="catagorized_challs != {}"
                    >
                        <!-- 生成分组的名字，可点击用于折叠 -->
                        <div class="group" @click="showToggle(key)">
                            <div class="group-name">
                                <font-awesome-icon
                                    :icon="collapsed[key] ? 'chevron-down' : 'chevron-right'"
                                    class="icon"
                                />
                                {{key.toUpperCase()}}
                            </div>
                            <div
                                class="group-number"
                            >{{cnt_done[key] + '/' + Object.keys(catagorized_challs[key]).length}}</div>
                        </div>
                        <!-- 生成会话头像 -->
                        <div v-show="collapsed[key]" class="group-list">
                            <!-- 此处偷懒，其实可以先sort好List再渲染 -->
                            <!-- 先生成还没完成的题目 -->
                            <div
                                v-for="(value2, key2) in catagorized_challs[key]"
                                :key="key2"
                                :class="['talk-item', active == key2 ? 'active' : '']"
                                @click="chooseTalk(key2)"
                                v-if="value2.done === 0"
                            >
                                <div class="avatar">
                                    <img :src="value2.avatar" />
                                </div>
                                <div class="text">
                                    <div class="name">{{value2.name}}</div>
                                    <div
                                        v-if="chat_storage[key2].length > 0"
                                    >{{chat_storage[key2][chat_storage[key2].length - 1].text}}</div>
                                </div>
                                <div
                                    class="unread"
                                    v-show="cnt_unread[key2] != 0"
                                >{{cnt_unread[key2]}}</div>
                            </div>
                            <!-- 后生成还完成的题目， 对公告不应用disable样式 -->
                            <div
                                v-for="(value3, key3) in catagorized_challs[key]"
                                :key="key3"
                                :class="['talk-item', 'disable', active == key3 ? 'active' : '']"
                                @click="chooseTalk(key3)"
                                v-if="value3.done != 0"
                            >
                                <div class="avatar">
                                    <img :src="value3.avatar" />
                                </div>
                                <div class="text">
                                    <div class="name">{{value3.name}}</div>
                                    <div
                                        v-if="chat_storage[key3].length > 0"
                                    >{{chat_storage[key3][chat_storage[key3].length - 1].text}}</div>
                                </div>
                                <div
                                    class="unread"
                                    v-show="cnt_unread[key3] != 0"
                                >{{cnt_unread[key3]}}</div>
                            </div>
                        </div>
                    </div>
                    <!-- 生成尚未加载成功的占位内容 -->
                    <div class="group-list" v-if="catagorized_challs === {}">
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
                    :talkList="chat_storage[active]"
                    :title="challs[active].name"
                    :avatar="challs[active].avatar"
                    :muted="active == notice"
                    @send_msg="handle_send"
                ></ChatWindow>
            </div>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import HeadBar from "../components/HeadBar.vue";
import ChatWindow from "../components/ChatWindow";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faChevronRight,
    faChevronDown,
    faFont
} from "@fortawesome/free-solid-svg-icons";
import { faGrin } from "@fortawesome/free-regular-svg-icons";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import ajax from "../tools/ajax";

library.add(faChevronRight);
library.add(faChevronDown);
library.add(faGrin);
library.add(faDocker);

export default {
    components: {
        HeadBar,
        ChatWindow
    },
    data() {
        return {
            persisted: [
                "chat_storage",
                "challs",
                "catagorized_challs",
                "cnt_unread",
                "cnt_done",
                "collapsed",
                "notice"
            ],
            //当前激活的会话
            active: null,
            //聊天记录
            chat_storage: {},
            //计时器id
            _time: "",
            //会话分组列表
            collapsed: {},
            //服务器返回的原始数据
            challs: {},
            //左边的会话列表
            catagorized_challs: {},
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
        showToggle(key) {
            this.collapsed[key] = !this.collapsed[key];
        },
        recv(msg, role) {
            this.$refs.chat.recv(msg, role);
        },
        chooseTalk(id) {
            var chall = this.challs[id];
            this.cnt_unread[id] = 0;
            this.active = id;
            // debugger;
            this.updateHints(id);
        },
        handle_send(msg) {
            if (this.func_registry[msg] !== undefined) {
                this.func_registry[msg]();
                return;
            }
            ajax.post("/challenges/attempt", {
                challenge_id: this.challs[this.active].id,
                submission: msg
            })
                .then(resp => {
                    if (resp.success == true) return resp.data;
                    throw resp;
                })
                .catch(error => console.log(error))
                .then(resp => {
                    this.recv(resp.message);
                    if (resp.status == "correct") {
                        var category = this.challs[
                            this.active
                        ].category.toLowerCase();
                        this.catagorized_challs[category][this.active].done = 1;
                        Vue.set(this.challs[this.active], "done", 1);
                        Vue.set(
                            this.cnt_done,
                            category,
                            this.cnt_done[category] + 1
                        );
                    }
                });
        },
        async getChallenges() {
            try {
                var challs = await ajax.get("/challenges")
                if (challs.success) challs = challs.data;
                else throw challs;
                var resp = await ajax.get("/users/me/solves")
                var solved = {};
                if (resp.success !== true) throw resp;
                for (var i of resp.data) solved[i.challenge_id] = true;
                this.generateList(challs, solved);
            } catch (error) {
                alert("请重新登陆");
                console.log(error);
                localStorage.removeItem("team_id");
                this.$router.push("/login");
            }
        },
        get_avatar(qq_id) {
            return `https://q2.qlogo.cn/headimg_dl?dst_uin=${qq_id}&spec=100`;
        },
        async updateChallenge(index) {
            try {
                var chall = await ajax.get("/challenges/" + this.challs[index].id);
                if (chall.success !== true) throw chall;
                else chall = chall.data;
                chall.done = this.challs[index].done;
                var avatar_url = chall.name.match(/\[.*\]/g);
                if (avatar_url !== null) {
                    chall.name = chall.name.replace(/\[.*\]/g, "");
                    var avatar = avatar_url[0].replace(/\[(.*)\]/g, "$1");
                    chall.avatar = isNaN(avatar)
                        ? avatar
                        : this.get_avatar(avatar);
                }
                Vue.set(this.challs, index, chall);
                return chall;
            } catch (err) { console.log(err); }
            return null;
        },
        async updateHints(index) {
            var chall = await this.updateChallenge(index);
            if (chall === null) return;
            var current = this.chat_storage[index];
            var recv = text =>
                current.push({
                    text: text,
                    admin: 2
                });
            var cnt_hints = chall.hints.length;
            if (current.length === 0) {
                recv(chall.description);
                for (var h of chall.files)
                    recv(`下载文件: [${h.split("/").slice(-1).pop().split("?")[0]}](${h})`);
            }
            var total = this.chat_storage[index].filter(
                o => o.admin === 2
            ).length;
            var hint_start = total - chall.files.length - 1;
            if (hint_start < cnt_hints) {
                for (var h = hint_start; h < cnt_hints; h++) {
                    var res = await ajax.get("/hints/" + chall.hints[h].id);
                    recv(res.data.content);
                }
            }
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
                if (!has_active)
                    this.active = null;
                this.challs = {}
                this.catagorized_challs = {}
            }
            for (let i in challenges) {
                var id = challenges[i].id;
                this.challs[id] = challenges[i];
                let type = challenges[i].category.toLowerCase();
                var avatar_url = challenges[i].name.match(/(.*)\[(.*)\]/);
                if (avatar_url !== null) {
                    challenges[i].name = avatar_url[1];
                    challenges[i].avatar = isNaN(avatar_url[2])
                        ? avatar_url[2]
                        : this.get_avatar(avatar_url[2]);
                }

                if (this.chat_storage[id] === undefined) {
                    Vue.set(this.chat_storage, id, []);
                    Vue.set(this.cnt_unread, id, 0);
                }
                let recvd_cnt = this.chat_storage[id].filter(
                    o => o.admin === 2
                ).length;
                var cnt_new = challenges[i].hints + challenges[i].files - recvd_cnt + 1;
                if (cnt_new > 0)
                    this.updateHints(id);
                this.cnt_unread[id] = cnt_new + this.cnt_unread[id];
                if (type === "notice") {
                    this.notice = id;
                    continue;
                }
                challenges[i].done = solved[challenges[i].id] ? 1 : 0;
                if (challenges[i].done) this.cnt_unread[id] = 0;
                if (this.collapsed[type] === undefined)
                    Vue.set(this.collapsed, type, false);
                if (this.catagorized_challs[type] === undefined)
                    Vue.set(this.catagorized_challs, type, {});
                Vue.set(this.catagorized_challs[type], id, challenges[i]);
            }
            //重新计算答题进度
            for (let i in this.catagorized_challs) {
                let done = 0;
                for (let j in this.catagorized_challs[i]) {
                    if (this.catagorized_challs[i][j].done === 1) done++;
                }
                Vue.set(this.cnt_done, i, done);
            }
        },
        cache() {
            for (var key of this.persisted) {
                var val = this[key];
                sessionStorage.setItem(key, JSON.stringify(this[key]));
            }
        }
    },
    created() {
        //读取缓存
        for (var key of this.persisted) {
            var val =
                sessionStorage.getItem(key) &&
                JSON.parse(sessionStorage.getItem(key));
            if (val !== null) this[key] = val;
        }
        this.getChallenges();

        this._time = setInterval(() => {
            if (this.active !== null) this.updateChallenge(this.active);
            this.getChallenges();
            this.cache();
        }, this.$time);

        var docker_request = method => {
            if (this.challs[this.active].type !== "dynamic_docker")
                return new Promise((rs, rj) => rj("本题🈚️docker环境"));
            var url = "/container?challenge_id=" + this.challs[this.active].id;
            return ajax.request(method, url).then(res => {
                if (res.success === false) throw res.msg;
                return res;
            });
        };
        this.func_registry = {
            查询分值: async () =>
                this.recv(`当前题目分值${
                    (await this.updateChallenge(this.active)).value
                }`),
            获取环境: async () => {
                try {
                    var chall = await docker_request("GET");
                    if (chall.remaining_time === undefined) {
                        await docker_request("POST");
                        this.recv("成功获取题目环境。");
                        this.recv(
                            "注意：同一账户同时只能开启同一题目，请注意合理安排做题时间"
                        );
                        chall = await docker_request("GET");
                    }
                    if (chall.port !== undefined)
                        this.recv(`nc ${chall.ip} ${chall.port}\n剩余时间：${
                            chall.remaining_time
                            }秒`);
                    else this.recv(`[题目链接](http://${chall.domain}) 剩余时间：${
                        chall.remaining_time
                        }秒`);
                } catch (err) { this.recv(err); }
            },
            延长时限: async () => {
                try {
                    await docker_request("PATCH")
                    this.recv("延长时限成功");
                } catch (err) { this.recv(err); }
            },
            销毁环境: async () => {
                try {
                    await docker_request("DELETE")
                    this.recv("销毁环境成功");
                } catch (err) { this.recv(err); }
            },
            重置环境: async () => {
                try {
                    await docker_request("POST");
                    this.recv("成功重置题目环境。");
                    await this.func_registry.获取环境();
                } catch (err) { this.recv(err); }
            },
            一键锤爆出题人的狗头: () => {
                var avatar = this.challs[this.active].avatar;
                var match = avatar.match(/https:\/\/q2\.qlogo\.cn\/headimg_dl\?dst_uin=([0-9]*)/)
                console.log(match)
                if (match === null)
                    this.recv(`锤不到（`);
                else
                    this.recv(`出题人QQ: ${match[1]}`);
            }
        };
    },
    beforeDestroy() {
        //缓存
        this.cache();
        //销毁计数器
        clearInterval(this._time);
    }
};
</script>

<style scoped>
.con {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ededed;
    background-position: center center;
    background-size: cover;
}
.container {
    height: 750px;
    width: 800px;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}
.main-container {
    height: 695px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
}
.left-container {
    height: 100%;
    width: 200px;
    box-sizing: border-box;
    border-right: 1px solid rgb(243, 245, 248);
    background: #ffffff;
    overflow: auto;
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
    width: 100px;
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
    background: rgb(240, 240, 240);
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
    width: 100px;
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
    background: #8fbbe2;
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