<template>
  <div class="d-flex flex-column h-100">
    <b-navbar type="dark" variant="dark" class="navbar-top">
      <b-button @click="onClick()">x</b-button>
    </b-navbar>
    <div class="flex-grow-1 overflow-scroll">
      <router-view />
    </div>
    <b-navbar type="dark" variant="dark" class="navbar-bottom">
      <router-link to="/">Points</router-link>
      <router-link to="/perks">Store</router-link>
      <router-link to="/wallet">Wallet</router-link>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    onClick: () => {
      window.top?.postMessage('message', 'https://localhost:8083');
    },
  },
});
</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
}
</style>
