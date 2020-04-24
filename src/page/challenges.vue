<template>
    <div class="con">
        <div class="container">
            <HeadBar></HeadBar>
            <div class="main-container">
                <div class="left-container">
                    <div class="group-container">
                        <div
                            v-if="this.notice !== ''"
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
                                    v-if="chatStorage[notice].length > 0"
                                >{{chatStorage[notice][chatStorage[notice].length - 1].text}}</div>
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
                                    :icon="has_category[key] ? 'chevron-down' : 'chevron-right'"
                                    class="icon"
                                />
                                {{key.toUpperCase()}}
                            </div>
                            <div
                                class="group-number"
                                v-if="key !== 'notice'"
                            >{{cnt_done[key] + '/' + Object.keys(catagorized_challs[key]).length}}</div>
                        </div>
                        <!-- 生成会话头像 -->
                        <div v-show="has_category[key]" class="group-list">
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
                                        v-if="chatStorage[key2].length > 0"
                                    >{{chatStorage[key2][chatStorage[key2].length - 1].text}}</div>
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
                                :class="['talk-item', key3 === notice ? '' : 'disable', active == key3 ? 'active' : '']"
                                @click="chooseTalk(key3)"
                                v-if="value3.done != 0"
                            >
                                <div class="avatar">
                                    <img :src="value3.avatar" />
                                </div>
                                <div class="text">
                                    <div class="name">{{value3.name}}</div>
                                    <div
                                        v-if="chatStorage[key3].length > 0"
                                    >{{chatStorage[key3][chatStorage[key3].length - 1].text}}</div>
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
                    v-bind:talkList="chatStorage[active]"
                    v-bind:enabled="active !== null"
                    v-bind:title="active!==null?challs[active].name:''"
                    v-bind:avatar="active!==null?challs[active].avatar:''"
                    v-bind:muted="active!==null && challs[active].done"
                    v-on:send_msg="send"
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
            //当前激活的会话
            active: null,
            //聊天记录
            chatStorage: {},
            //计时器id
            _time: "",
            //会话分组列表
            has_category: {},
            //服务器返回的原始数据
            challs: {},
            //左边的会话列表
            catagorized_challs: {},
            //题目的完成进度
            cnt_done: {},
            //未读消息数
            cnt_unread: {},
            //公告的id
            notice: "",
            chatprops: {}
        };
    },
    methods: {
        showToggle(key) {
            this.has_category[key] = !this.has_category[key];
        },
        recv(msg, role) {
            this.$refs.chat.recv(msg, role);
        },
        chooseTalk(id) {
            var chall = this.challs[id];
            this.cnt_unread[id] = 0;
            this.active = id;
            // debugger;
            this.updateChallenge(id).then(chall => {
                if (this.chatStorage[id].length === 0)
                    this.recv(chall.description, 2);
                if (this.chatStorage[id].length - 1 < chall.hints.length) {
                    for (var h of chall.hints) {
                        ajax.get("/hints/" + h.id).then(res =>
                            this.recv(res.data.content, 2)
                        );
                    }
                }
            });
        },
        send(msg) {
            console.log(msg);
            switch (msg) {
                case "查询分值":
                    this.updateChallenge(this.active).then(chall => {
                        this.recv("当前题目分值" + chall.value);
                    });
                    break;
                case "获取环境":
                    var url =
                        "/container?challenge_id=" +
                        this.challs[this.active].id;
                    ajax.get(url)
                        .then(res => {
                            if (res.remaining_time === undefined) {
                                return ajax.post(url).then(res => {
                                    if (res.success === true) {
                                        this.recv("成功获取题目环境。");
                                        this.recv(
                                            "注意：同一账户同时只能开启同一题目，请注意合理安排做题时间"
                                        );
                                    } else this.recv(res.msg);
                                    return ajax.get(url);
                                });
                            } else return res;
                        })
                        .catch(err => {
                            if (err.status === 404)
                                this.recv("本题🈚️题目环境");
                        })
                        .then(chall => {
                            this.recv(chall.domain);
                            this.recv(
                                "剩余时间：" + chall.remaining_time + "秒"
                            );
                        });
                    break;
                case "延长时限":
                    var url =
                        "/container?challenge_id=" +
                        this.challs[this.active].id;
                    ajax.request("PATCH", url)
                        .then(res => {
                            if (res.success === true) {
                                this.recv("延长时限成功");
                                return;
                            } else this.recv(res.msg);
                        })
                        .catch(err => console.log(err));
                    break;
                case "销毁环境":
                    var url =
                        "/container?challenge_id=" +
                        this.challs[this.active].id;
                    ajax.request("DELETE", url)
                        .then(res => {
                            if (res.success === true) {
                                this.recv("销毁成功");
                                return;
                            } else this.recv(res.msg);
                        })
                        .catch(err => console.log(err));
                    break;
                default:
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
                                this.catagorized_challs[category][
                                    this.active
                                ].done = 1;
                                Vue.set(this.challs[this.active], "done", 1);
                                Vue.set(
                                    this.cnt_done,
                                    category,
                                    this.cnt_done[category] + 1
                                );
                            }
                        });
            }
        },
        getChallenges() {
            ajax.get("/challenges")
                .then(resp => resp.data)
                .catch(error => {
                    alert("请重新登陆");
                    console.log(error);
                    localStorage.removeItem("team_id");
                    this.$router.push("/login");
                })
                .then(data =>
                    ajax.get("/users/me/solves").then(resp => {
                        var solved = {};
                        if (resp.success !== true) throw resp;
                        for (var i of resp.data) solved[i.challenge_id] = true;
                        this.generateList(data, solved);
                    })
                )
                .catch(err => console.log(err));
        },
        updateChallenge(index) {
            return ajax
                .get("/challenges/" + this.challs[index].id)
                .then(res => {
                    var chall = res.data;
                    chall.done = this.challs[this.active].done;
                    var avatar_url = chall.name.match(/\[.*\]/g)
                    if(avatar_url !== null) {
                        chall.name = chall.name.replace(/\[.*\]/g, '')
                        chall.avatar = avatar_url[0].replace(/\[(.*)\]/g, "$1")
                    }
                    Vue.set(this.challs, this.active, chall);
                    return chall;
                }).catch(err => console.log(err));
        },
        generateList(challenges, solved) {
            for (let i in challenges) {
                let type = challenges[i].category.toLowerCase();
                var avatar_url = challenges[i].name.match(/\[.*\]/g)
                if(avatar_url !== null) {
                    challenges[i].name = challenges[i].name.replace(/\[.*\]/g, '')
                    challenges[i].avatar = avatar_url[0].replace(/\[(.*)\]/g, "$1")
                }

                if (this.chatStorage[i] === undefined) {
                    Vue.set(this.chatStorage, i, []);
                    Vue.set(this.cnt_unread, i, 0);
                }
                let recvd_cnt = this.chatStorage[i].filter(o => o.admin === 2)
                    .length;
                this.cnt_unread[i] = challenges[i].hints - recvd_cnt + 1;
                if (type === "notice") {
                    this.notice = i;
                    continue;
                }
                challenges[i].done = solved[challenges[i].id] ? 1 : 0;
                if (challenges[i].done) this.cnt_unread[i] = 0;
                if (this.has_category[type] === undefined) {
                    Vue.set(this.has_category, type, true);
                    Vue.set(this.catagorized_challs, type, {});
                }
                Vue.set(this.catagorized_challs[type], i, challenges[i]);
            }
            this.challs = challenges;
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
            sessionStorage.setItem("challs", JSON.stringify(this.challs));
            sessionStorage.setItem(
                "chatStorage",
                JSON.stringify(this.chatStorage)
            );
            sessionStorage.setItem(
                "catagorized_challs",
                JSON.stringify(this.catagorized_challs)
            );
            sessionStorage.setItem(
                "cnt_unread",
                JSON.stringify(this.cnt_unread)
            );
            sessionStorage.setItem("cnt_done", JSON.stringify(this.cnt_done));
            sessionStorage.setItem("type", JSON.stringify(this.has_category));
        }
    },
    created() {
        //读取缓存
        let challs =
            sessionStorage.getItem("challs") &&
            JSON.parse(sessionStorage.getItem("challs"));
        let chatStorage =
            sessionStorage.getItem("chatStorage") &&
            JSON.parse(sessionStorage.getItem("chatStorage"));
        let catagorized_challs =
            sessionStorage.getItem("catagorized_challs") &&
            JSON.parse(sessionStorage.getItem("catagorized_challs"));
        let cnt_unread =
            sessionStorage.getItem("cnt_unread") &&
            JSON.parse(sessionStorage.getItem("cnt_unread"));
        let cnt_done =
            sessionStorage.getItem("cnt_done") &&
            JSON.parse(sessionStorage.getItem("cnt_done"));
        let has_category =
            sessionStorage.getItem("type") &&
            JSON.parse(sessionStorage.getItem("type"));
        //若有缓存则直接使用
        if (
            challs != null &&
            chatStorage != null &&
            catagorized_challs != null &&
            cnt_done != null &&
            has_category != null
        ) {
            this.challs = challs;
            this.chatStorage = chatStorage;
            this.catagorized_challs = catagorized_challs;
            this.cnt_unread = cnt_unread;
            this.cnt_done = cnt_done;
            this.has_category = has_category;
            sessionStorage.clear();
            this.getChallenges();
        }
        //若无缓存则加载
        else {
            this.getChallenges();
        }
        this._time = setInterval(() => {
            if (this.active !== null) this.updateChallenge(this.active);
            this.getChallenges();
            this.cache();
        }, this.$time);
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
    background: url("../../static/images/back.png") no-repeat;
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