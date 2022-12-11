<template>
    <div class="flex-grow-1 overflow-auto">
        <component :key="key" v-for="(token, key) of list" :is="token.component" :token="token" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../stores/Wallet';
import { useAccountStore } from '../stores/Account';
import BaseCardERC20 from '../components/BaseCardERC20.vue';
import BaseCardERC721 from '../components/BaseCardERC721.vue';

export default defineComponent({
    name: 'Home',
    components: {
        BaseCardERC20,
        BaseCardERC721,
    },
    computed: {
        ...mapStores(useWalletStore),
        ...mapStores(useAccountStore),
        list: function (): any {
            return [...this.walletStore.erc20, ...this.walletStore.erc721].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            );
        },
    },
    mounted() {
        this.accountStore.init(this.$route.query).then(() => {
            this.walletStore.list();
        });
    },
});
</script>
