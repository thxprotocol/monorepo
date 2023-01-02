<template>
    <b-card class="m-2">
        <b-card-title class="d-flex">
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-success fw-bold">{{ reward.amount }}</div>
        </b-card-title>

        <b-card-text>
            {{ reward.description }}
        </b-card-text>

        <b-input-group v-if="accountStore.isAuthenticated && referralUrl">
            <b-form-input :model-value="referralUrl" />
            <b-input-group-append>
                <b-button
                    size="sm"
                    variant="primary"
                    v-clipboard:copy="referralUrl"
                    v-clipboard:success="onCopySuccess"
                >
                    <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                    <i v-else class="fas fa-clipboard px-2"></i>
                </b-button>
            </b-input-group-append>
        </b-input-group>
        <b-button v-else variant="primary" block class="w-100" @click="onClickClaim">
            Claim <strong>{{ reward.amount }} points</strong>
        </b-button>
        <div
            v-if="accountStore.isAuthenticated && referralUrl"
            v-bind:data-url="referralUrl"
            v-bind:data-title="reward.title"
            class="sharethis-inline-share-buttons mt-3"
        ></div>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';

export default defineComponent({
    name: 'BaseCardRewardReferral',

    props: {
        reward: {
            type: Object as PropType<TReferralReward>,
            required: true,
        },
    },
    data() {
        return {
            isCopied: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        referralUrl() {
            const { getConfig, account, poolId } = useAccountStore();
            if (!getConfig || !account) return '';

            const { origin } = getConfig(poolId);
            if (!origin || !account.sub) return '';
            return `${origin}?ref=${account.sub}`;
        },
    },
    mounted() {
        const scriptJs = document.createElement('script');
        scriptJs.setAttribute('type', 'text/javascript');
        scriptJs.setAttribute(
            'src',
            'https://platform-api.sharethis.com/js/sharethis.js#property=63b2d13f3d4c89001a1d4ca3&product=inline-share-buttons&source=platform',
        );
        scriptJs.setAttribute('async', 'async');
        document.head.appendChild(scriptJs);
    },

    methods: {
        onClickClaim() {
            this.accountStore.api.userManager.cached.signinPopup();
        },
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>
