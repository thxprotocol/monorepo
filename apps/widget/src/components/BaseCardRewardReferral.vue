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
            Sign in &amp; claim <strong>{{ reward.amount }} points</strong>
        </b-button>
        <div v-if="accountStore.isAuthenticated && referralUrl" class="pt-2">
            <BaseBtnShareTwitter :url="referralUrl" text="Please have a look at this:" class="me-2" />
            <BaseBtnShareLinkedin :url="referralUrl" class="me-2" />
            <BaseBtnShareWhatsapp :url="referralUrl" class="me-2" />
            <BaseBtnShareTelegram :url="referralUrl" text="Please have a look at this!" class="me-2" />
            <BaseBtnShareEmail :url="referralUrl" subject="Please have a look at this!" class="me-2" />
        </div>
    </b-card>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import BaseBtnShareWhatsapp from '../components/BaseBtnShareWhatsapp.vue';
import BaseBtnShareEmail from '../components/BaseBtnShareEmail.vue';
import BaseBtnShareTwitter from '../components/BaseBtnShareTwitter.vue';
import BaseBtnShareLinkedin from '../components/BaseBtnShareLinkedin.vue';
import BaseBtnShareTelegram from '../components/BaseBtnShareTelegram.vue';

export default defineComponent({
    name: 'BaseCardRewardReferral',
    components: {
        BaseBtnShareWhatsapp,
        BaseBtnShareEmail,
        BaseBtnShareTwitter,
        BaseBtnShareLinkedin,
        BaseBtnShareTelegram,
    },
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

            const hash = window.btoa(JSON.stringify({ sub: account.sub, uuid: this.reward.uuid }));
            return `${origin}?ref=${hash}`;
        },
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
