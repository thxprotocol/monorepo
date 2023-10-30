<template>
    <BaseCardCollapse :quest="reward" :image="reward.image" :visible="!!authStore.oAuthShare">
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fas fa-comments me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1">{{ reward.title }}</div>
            <div class="text-accent fw-bold">{{ reward.amount }}</div>
        </template>

        <b-card-text>
            {{ reward.description }}
        </b-card-text>

        <b-input-group v-if="authStore.oAuthShare">
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

        <div v-if="authStore.oAuthShare && referralUrl" class="pt-2">
            <BaseBtnShareTwitter :url="referralUrl" text="Please have a look at this:" class="me-2" />
            <BaseBtnShareLinkedin :url="referralUrl" class="me-2" />
            <BaseBtnShareWhatsapp :url="referralUrl" class="me-2" />
            <BaseBtnShareTelegram :url="referralUrl" text="Please have a look at this!" class="me-2" />
            <BaseBtnShareEmail :url="referralUrl" subject="Please have a look at this!" class="me-2" />
        </div>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useRewardStore } from '../stores/Reward';
import { useAuthStore } from '../stores/Auth';
import BaseBtnShareWhatsapp from '../components/BaseBtnShareWhatsapp.vue';
import BaseBtnShareEmail from '../components/BaseBtnShareEmail.vue';
import BaseBtnShareTwitter from '../components/BaseBtnShareTwitter.vue';
import BaseBtnShareLinkedin from '../components/BaseBtnShareLinkedin.vue';
import BaseBtnShareTelegram from '../components/BaseBtnShareTelegram.vue';
import BaseCardCollapse from '../components/BaseCardCollapse.vue';

export default defineComponent({
    name: 'BaseCardQuestInvite',
    components: {
        BaseCardCollapse,
        BaseBtnShareWhatsapp,
        BaseBtnShareEmail,
        BaseBtnShareTwitter,
        BaseBtnShareLinkedin,
        BaseBtnShareTelegram,
    },
    props: {
        reward: {
            type: Object as PropType<TQuestInvite>,
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
        ...mapStores(useAuthStore),
        ...mapStores(useRewardStore),
        referralUrl() {
            const { config, account, poolId } = useAccountStore();
            if (!account || !this.reward) return '';
            if (!config.origin) return '';
            const hash = window.btoa(JSON.stringify({ sub: account.sub, poolId, uuid: this.reward.uuid }));
            const url = new URL(`${config.origin}/${this.reward.pathname || ''}`);
            url.searchParams.append('ref', hash);
            return url.toString();
        },
    },
    methods: {
        onClickClaim() {
            this.accountStore.signin();
        },
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>
