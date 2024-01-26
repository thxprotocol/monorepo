<template>
    <b-card class="bg-splash">
        <div
            v-if="accountStore.account"
            class="d-flex justify-content-center align-items-center p-3"
            style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.35); width: 100%"
        >
            <b-avatar size="50" :src="accountStore.account.profileImg" class="gradient-border-xl" />
            <div class="px-3" style="min-width: 200px">
                <h3 class="text-white mb-0">{{ accountStore.account?.username }}</h3>
            </div>
        </div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { decodeHTML } from '../../utils/decode-html';
import { mapStores } from 'pinia';
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    name: 'BaseCardWallet',
    data() {
        return {
            decodeHTML,
            isModalPoolSubscriptionShown: false,
            isModalWalletAccessShown: false,
            isRefreshing: false,
            isIframe: window.self !== window.top,
            error: '',
            screenWidth: window.innerWidth,
        };
    },
    props: {
        height: Number,
    },
    computed: {
        ...mapStores(useAuthStore),
        ...mapStores(useAccountStore),
        ...mapStores(useQuestStore),
    },
});
</script>
