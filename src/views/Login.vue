<template>
  <div class="container">
    <div class="login-container">
      <div class="top-bar">
        <div class="red"></div>
        <div class="tip">
          <font-awesome-icon id="toggle" class="icon" icon="pen" @click="showToggle"/>
          <span class="tiptext">{{ showLogin ? '注册' : '登录' }}</span>
        </div>
      </div>
      <div v-show="showLogin" class="middle">
        <img src="../assets/logo.svg"/>
      </div>
      <div v-show="showLogin" class="bottom">
        <input v-model="loginName" placeholder="队伍名称" type="text"/>
        <input v-model="loginPassword" placeholder="密码" type="password" @keydown.enter="login"/>
        <font-awesome-icon :icon="['far', 'arrow-alt-circle-right']" class="submit" @click="login"/>
      </div>
      <div v-show="!showLogin" class="register-container">
        <input v-model="registerName" placeholder="队伍名称" type="text"/>
        <input v-model="registerEmail" placeholder="联系邮箱" type="text"/>
        <input v-model="registerPassword" placeholder="密码" type="password"/>
        <input
            v-model="registerPasswordRepeat"
            placeholder="重复密码"
            type="password"
            @keydown.enter="register"
        />
        <font-awesome-icon :icon="['far', 'arrow-alt-circle-right']" class="submit" @click="register"/>
      </div>
    </div>
  </div>
</template>

<script>
import {library} from '@fortawesome/fontawesome-svg-core';
import {faPen} from '@fortawesome/free-solid-svg-icons';
import {faArrowAltCircleRight} from '@fortawesome/free-regular-svg-icons';
import ctfd from '../ctfd';

library.add(faPen);
library.add(faArrowAltCircleRight);
export default {
  data() {
    return {
      options: {},
      showLogin: true,
      loginName: '',
      loginPassword: '',
      registerName: '',
      registerEmail: '',
      registerPassword: '',
      registerPasswordRepeat: '',
    };
  },
  methods: {
    showToggle() {
      this.showLogin = !this.showLogin;
    },
    async login() {
      if (this.loginName !== '' && this.loginPassword !== '') {
        try {
          let resp = await ctfd.post('/login', {
            name: this.loginName,
            password: this.loginPassword,
          });
          resp = await resp.json();
          if (resp.success) {
            localStorage.setItem('team_id', this.loginName);
            localStorage.setItem('nonce', resp.data.nonce);
            await this.$router.push('/challenges');
          } else {
            alert('用户名或密码错误');
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        if (this.loginName === '') {
          this.messageBox('登录名不能为空');
        } else if (this.loginPassword === '') {
          this.messageBox('密码不能为空');
        }
      }
    },
    async register() {
      if (
          this.registerName === '' ||
          this.registerEmail === '' ||
          this.registerPassword === '' ||
          this.registerPasswordRepeat === ''
      ) {
        this.messageBox('请将信息填写完整');
      } else {
        if (this.registerPassword !== this.registerPasswordRepeat) {
          this.messageBox('两次密码不一致');
        } else {
          let data = {
            name: this.registerName,
            email: this.registerEmail,
            password: this.registerPassword,
          };
          let resp = await ctfd.post('/register', data);
          resp = await resp.json();
          if (resp.success) {
            alert('注册成功');
            this.showToggle();
          } else {
            alert(resp.message);
          }
        }
      }
    },
  },
};
</script>

<style>
.container {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  background-position: center center;
  background-size: cover;
}

.login-container {
  height: 320px;
  width: 250px;
  border-radius: 0px;
  border: 1px solid rgba(0, 0, 0, 0.4);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  position: relative;
}

.top-bar {
  height: 30px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  font-size: 16px;
  color: #464646;
  margin: 0 10px;
  cursor: pointer;
}

.icon:hover {
  color: rgb(28, 167, 242);
}

.red {
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: rgb(252, 71, 72);
  margin: 0 10px;
  cursor: pointer;
}

.middle {
  height: 140px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.middle img {
  height: 100px;
  width: 100px;
  border-radius: 50%;
  border: 1px solid gray;
}

.bottom {
  height: 150px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

input {
  height: 35px;
  width: 185px;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #c8c8c8;
  outline: none;
  font-size: 16px;
  padding-right: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

input:hover {
  background: rgba(60, 60, 60, 0.4);
  border-bottom: 1px solid #3498ff;
}

.submit {
  height: 20px;
  width: 20px;
  cursor: pointer;
  color: #ffffff;
}

.bottom .submit {
  position: absolute;
  bottom: 47px;
  right: 20px;
}

.submit:hover {
  color: rgb(28, 167, 242);
}

.register-container {
  height: 290px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.register-container input {
  margin: 5px 0;
}

.register-container .submit {
  margin: 10px 0;
}

.message-container {
  height: 130px;
  width: 420px;
  border-radius: 0px;
  border: 1px solid rgb(0, 102, 255);
  background: rgba(19, 19, 19, 0.5);
  position: absolute;
  top: -40px;
  box-sizing: border-box;
  padding: 20px;
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
}

.message-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  height: 32px;
  line-height: 32px;
  width: 100px;
  border-radius: 0px;
  background: #0084ff;
  font-size: 12px;
  text-align: center;
  border: 1px solid rgb(0, 110, 255);
  cursor: pointer;
  color: #ffffff;
}

.message-button:hover {
  color: #ffffff;
  background: rgb(38, 123, 253);
  border: 1px solid rgb(129, 169, 241);
}

.tiptext {
  visibility: hidden;
  width: 60px;
  background-color: rgba(22, 22, 22, 0.6);
  color: #fff;
  text-align: center;
  margin: 0 10px;
  border-radius: 0px;

  position: absolute;
}

.tip:hover .tiptext {
  visibility: visible;
}

input:-webkit-autofill,
textarea:-webkit-autofill,
select:-webkit-autofill {
  box-shadow: 0 0 0px 1000px rgba(0, 0, 0, 0.5) inset;
  color: #ffffff;
}
</style>