<template>
    <div :class="['talk-item', active ? 'active' : '', online ? '' : 'disable']" @click="$emit('select')">
        <div class="avatar">
            <img :src="avatar" />
        </div>
        <div class="text">
            <div class="name">{{ name }}</div>
            <div v-if="caption">{{ caption }}</div>
        </div>
        <div class="unread" v-show="unread && unread != 0">{{ unread }}</div>
    </div>
</template>

<script>
export default {
    props: {
        id: Number,
        name: String,
        avatar: String,
        active: {
            type: Boolean,
            default: false
        },
        online: {
            type: Boolean,
            default: true
        },
        unread: Number,
        caption: String
    },
    data() {
        return {};
    },
    setup() {}
};
</script>

<style scoped>
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
.talk-item .unread {
    height: 18px;
    width: 18px;
    border-radius: 50%;
    background: rgb(239, 59, 57);
    color: white;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
}
.talk-item .unread {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 10px;
    margin: auto;
}
.talk-item.disable {
    color: rgb(182, 182, 182);
}
.talk-item.disable .avatar img {
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
.talk-item .text div {
    margin: 0;
    text-align: left;
    line-height: 20px;
}
.talk-item .text .name {
    font-size: 16px;
    width: 100%;
    white-space: nowrap;
}
</style>