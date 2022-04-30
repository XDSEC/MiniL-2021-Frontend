<template>
  <div class="top-container">
    <!-- 关闭最大化最小化 按钮 -->
    <div class="button-container">
      <div class="red"></div>
      <div class="yellow"></div>
      <div class="green"></div>
    </div>
    <!-- 中间导航按钮 -->
    <div class="nav-contaier">
      <font-awesome-icon
          :class="[page == 'Challenges' ? 'active' : '', 'nav-icon']"
          icon="comment-dots"
          @click="$router.push('/challenges')"
      />
      <font-awesome-icon
          :class="[page == 'Team' ? 'active' : '', 'nav-icon']"
          icon="user"
          @click="$router.push('/team/me')"
      />
      <font-awesome-icon
          :class="[page == 'Board' ? 'active' : '', 'nav-icon']"
          icon="th-large"
          @click="$router.push('/board')"
      />
    </div>
    <!-- 右边头像 -->
    <div class="avatar-container">
      <div class="avatar" @click="logOut" @mouseout="logout = false" @mouseover="logout = true">
        <img v-show="!logout" src="../assets/logo.svg" title="登出"/>
        <div v-show="logout" class="logout">
          <font-awesome-icon icon="sign-out-alt"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCommentDots, faSignOutAlt, faThLarge, faUser} from '@fortawesome/free-solid-svg-icons';

library.add(faCommentDots);
library.add(faThLarge);
library.add(faUser);
library.add(faSignOutAlt);

export default {
  name: 'headbar',
  data() {
    return {
      page: '',
      logout: false,
    };
  },
  methods: {
    logOut() {
      localStorage.clear();
      this.$router.push('/login');
    },
  },
  created() {
    this.page = this.$route.name;
  },
  beforeUpdate() {
    this.page = this.$route.name;
  },
  mounted() {
  },
};
</script>

<style scoped>
.top-container {
  height: 50px;
  width: 100%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-container {
  height: 100%;
  width: 75px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.button-container > div {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  margin: 0 4px;
  cursor: pointer;
}

.button-container .red {
  background: rgb(252, 71, 72);
}

.button-container .yellow {
  background: none;
}

.button-container .green {
  background: none;
}

.avatar-container {
  margin: 0 10px;
}

.avatar {
  height: 30px;
  width: 30px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.avatar > img {
  height: 100%;
  width: 100%;
}

.nav-icon {
  height: 28px;
  width: 24px;
  color: rgb(241, 241, 241);
  margin: 0 20px;
  cursor: pointer;
}

.nav-icon.active {
  color: rgb(28, 167, 242);
}

.logout {
  height: 100%;
  width: 100%;
  background: rgb(244, 244, 244);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>