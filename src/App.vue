<template>
  <div class="app-container">
    <meta content="no-referrer" name="referrer"/>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
.container {
  height: 100%;
  width: 100%;
  border-radius: 3px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.app-container {
  height: 100%;
  width: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: fixed;
  color: #cccccc;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent center center;
  background-size: cover;
  background-color: #303030;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
</style>
