<template>
    <b-card v-if="token.reward" body-class="d-flex align-items-center py-2">
        <b-img v-if="token.reward.image" :src="token.reward.image" height="30" class="rounded" />
        <div class="flex-grow-1">
            {{ token.reward.title }}
            {{ token.amount }}
        </div>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';

export default defineComponent({
    name: 'BaseCardGalachain',
    props: {
        token: {
            type: Object as PropType<TRewardDiscordRolePayment>,
            required: true,
        },
    },
    data() {
        return {
            isVisible: false,
            isModalURLShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
    },
});
</script>
