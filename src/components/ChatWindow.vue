<template>
  <div class="container">
    <!-- 顶部显示回话标题 -->
    <div class="title-container">{{ title }}</div>
    <!-- 聊天信息主体 -->
    <div class="info-container">
      <a
          ref="scr"
          v-smooth-scroll="{
                    duration: 1000,
                    container: '.info-container'
                }"
          class="scroller"
          href="#bottom"
      ></a>
      <div v-for="(item, index) in talkList" :key="index" :class="[item.is_send ? 'mine' : '', 'info-item']">
        <div class="avatar">
          <img :src="item.avatar"/>
        </div>
        <div class="text-container">
          <div
              v-if="item.admin !== 0"
              class="text"
              style="white-space: inherit !important"
              v-html="renderMarkdown(item.text)"
          ></div>
        </div>
      </div>
      <span id="bottom"></span>
    </div>
    <!-- 输入框主体 -->
    <div class="input-container">
      <div class="tools-bar">
        <div :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon :icon="['far', 'grin']" fixed-width @click="$emit('send_msg', '查询分值')"/>
        </div>
        <div :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon
              :icon="['fas', 'hammer']"
              fixed-width
              width="2em"
              @click="$emit('send_msg', '一键锤爆出题人')"
          />
        </div>

        <div :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon :icon="['fab', 'docker']" fixed-width @click="show_menu = !show_menu"/>
        </div>
        <div v-if="show_menu" :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon
              :icon="['fas', 'play-circle']"
              class="menu-item"
              fixed-width
              @click="$emit('send_msg', '获取环境')"
          />
        </div>
        <div v-if="show_menu" :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon
              :icon="['fas', 'clock']"
              class="menu-item"
              fixed-width
              @click="$emit('send_msg', '延长时限')"
          />
        </div>
        <div v-if="show_menu" :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon
              :icon="['fas', 'stop-circle']"
              class="menu-item"
              fixed-width
              @click="$emit('send_msg', '销毁环境')"
          />
        </div>
        <div v-if="show_menu" :class="['tools-icon', muted ? 'disable' : '']">
          <font-awesome-icon
              :icon="['fas', 'redo-alt']"
              :transform="{ rotate: 42 }"
              class="menu-item"
              fixed-width
              @click="$emit('send_msg', '重置环境')"
          />
        </div>
      </div>
      <textarea
          v-if="!muted"
          id="input-area"
          ref="textarea"
          v-model="message"
          @keydown.enter.prevent="$emit('send_msg', message)"
      ></textarea>
      <textarea v-if="muted" disabled placeholder="你已被禁言"></textarea>
    </div>
  </div>
</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faClock,
  faHammer,
  faPlayCircle,
  faRedoAlt,
  faStopCircle,
  faThumbtack,
} from '@fortawesome/free-solid-svg-icons';
import {faGrin} from '@fortawesome/free-regular-svg-icons';
import {faDocker} from '@fortawesome/free-brands-svg-icons';
import {marked} from 'marked';
import dompurify from 'dompurify';

import {get_avatar, render} from '../utils';

library.add(faPlayCircle, faStopCircle, faClock, faThumbtack, faRedoAlt, faDocker, faGrin, faHammer);
export default {
  props: ['talkList', 'title', 'muted'],
  data() {
    return {
      message: '',
      position: 0,
      show_menu: false,
    };
  },
  mounted() {
    marked.setOptions({
      gfm: true,
      breaks: true,
    });
  },
  methods: {
    renderMarkdown(content) {
      return dompurify.sanitize(marked.parse(content));
    },
    send(msg = this.message) {
      if (msg === '' || this.muted) return;
      let avatar = '/img/logo.c9d12710.svg';
      let qqmail = localStorage.getItem('email').match(/([0-9]*)@qq\.com/);
      if (qqmail !== null) avatar = get_avatar(qqmail[1]);
      this.talkList.push({
        avatar: avatar,
        text: render(msg),
        is_send: true,
      });
      this.message = '';
      this.$refs.scr.click();
    },
    recv(msg, avatar) {
      this.talkList.push({
        avatar: avatar,
        text: render(msg),
        is_send: false,
      });
      this.$refs.scr.click();
    },
  },
  updated() {
    let message = document.getElementById('input-area');
    if (message && !message.matches(':focus')) this.$refs.scr.click();
  },
};
</script>

<style>
.avatar img {
  height: 100%;
  width: 100%;
}

.text div {
  margin: 0;
  text-align: left;
  line-height: 20px;
}

.text p {
    margin: 4px 6px 4px 6px;
}

a {
    color: #0078d6;
    text-decoration: none;
}

.text .name {
  font-size: 16px;
  width: 100%;
  white-space: nowrap;
}

.title-container {
  height: 45px;
  line-height: 45px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 20px;
  font-size: 14px;
  text-align: left;
  background: transparent;
  color: rgb(255, 255, 255);
}

.info-container {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.info-item {
  height: auto;
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 20px 0;
}

.info-item.mine {
  flex-direction: row-reverse;
}

.info-item .avatar {
  height: 36px;
  width: 36px;
  min-height: 36px;
  min-width: 36px;
  border-radius: 50%;
  margin-top: 25px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 10px 0 20px;
}

.info-item.mine .avatar {
  margin: 0 20px 0 10px;
}

.info-item .text-container {
  width: 70%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.info-item.mine .text-container {
  flex-direction: row-reverse;
}

.text-container .text {
  line-height: 20px;
  font-size: 16px;
  padding: 5px;
  border-radius: 5px;
  text-align: left;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  word-break: break-all;
}

.input-container {
  height: 218px;
  width: 100%;
  box-sizing: border-box;
  border-top: 0 solid black;
  border-left: 0 solid black;
  background: rgba(40, 40, 40, 0.1);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.input-container .tools-bar {
  font-size: 1.2rem;
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  align-self: start;
  padding-left: 1.2rem;
}

.tools-icon {
  height: 2rem;
  color: rgb(255, 255, 255);
  cursor: pointer;
  padding-left: 1rem;
  padding-right: 1rem;
}

.tools-icon:hover {
  -webkit-transform: scale(1.2, 1.2) translate3d(0, 0, 0);
  transform: scale(1.2, 1.2) translate3d(0, 0, 0);
}

.tools-icon.disable {
  cursor: not-allowed;
}

.menu-input {
  display: none;
}

.menu-dropdown {
  cursor: pointer;
}

.menu-input + .menu {
  display: none;
}

.menu-input:checked + .menu {
  display: flex;
}

.menu-item {
  cursor: pointer;
  margin: -10px -20px;
  padding: 10px 20px;
}

.input-container textarea {
  height: 182px;
  width: 100%;
  border: none;
  outline: none;
  box-sizing: border-box;
  padding: 10px;
  resize: none;
  background: rgba(0, 0, 0, 0.4);
  color: white;
}

.input-container textarea:disabled {
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.2);
  color: white;
}

::-webkit-scrollbar {
  width: 0;
}
</style>