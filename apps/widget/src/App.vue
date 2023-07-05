<template>
    <div id="main">
        <router-view />
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { GTM } from './config/secrets';
import { initGTM } from './utils/ga';

import './scss/main.scss';

export default defineComponent({
    components: {},
    data() {
        return {};
    },
    computed: {},
    async created() {
        if (GTM) initGTM();
    },
});
</script>
