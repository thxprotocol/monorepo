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
            <b-form-input :model-value="inviteUrl" />
            <b-input-group-append>
                <b-button size="sm" variant="primary" v-clipboard:copy="inviteUrl" v-clipboard:success="onCopySuccess">
                    <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                    <i v-else class="fas fa-clipboard px-2"></i>
                </b-button>
            </b-input-group-append>
        </b-input-group>

        <b-button v-else variant="primary" block class="w-100" @click="onClickClaim">
            Sign in &amp; claim <strong>{{ reward.amount }} points</strong>
        </b-button>

        <div v-if="authStore.oAuthShare && inviteUrl" class="pt-2">
            <BaseBtnShareTwitter :url="inviteUrl" text="Please have a look at this:" class="me-2" />
            <BaseBtnShareLinkedin :url="inviteUrl" class="me-2" />
            <BaseBtnShareWhatsapp :url="inviteUrl" class="me-2" />
            <BaseBtnShareTelegram :url="inviteUrl" text="Please have a look at this!" class="me-2" />
            <BaseBtnShareEmail :url="inviteUrl" subject="Please have a look at this!" class="me-2" />
        </div>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useRewardStore } from '../../stores/Reward';
import { useAuthStore } from '../../stores/Auth';

export default defineComponent({
    name: 'BaseCardQuestInvite',
    props: {
        reward: {
            type: Object as PropType<TQuestInvite>,
            required: true,
        },
    },
    data() {
        return { isCopied: false };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useRewardStore),
        inviteUrl() {
            const accountStore = useAccountStore();
            if (!accountStore.account || !this.reward) return '';
            const hash = window.btoa(
                JSON.stringify({ sub: accountStore.account.sub, poolId: accountStore.poolId, uuid: this.reward.uuid }),
            );
            const url = new URL(`${accountStore.config.domain}/${this.reward.pathname || ''}`);
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
