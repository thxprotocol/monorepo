<template>
    <BaseCardCollapse
        :quest="quest"
        :image="quest.image"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fas fa-comments me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <b-button v-if="!accountStore.isAuthenticated" variant="primary" block class="w-100" @click="onClickClaim">
            Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
        </b-button>

        <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

        <b-input-group v-else>
            <b-form-input :model-value="inviteUrl" />
            <b-input-group-append>
                <b-button size="sm" variant="primary" v-clipboard:copy="inviteUrl" v-clipboard:success="onCopySuccess">
                    <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                    <i v-else class="fas fa-clipboard px-2"></i>
                </b-button>
            </b-input-group-append>
        </b-input-group>

        <div v-if="accountStore.isAuthenticated && inviteUrl" class="pt-2">
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
import { useQuestStore } from '../../stores/Quest';
import { useAuthStore } from '../../stores/Auth';

export default defineComponent({
    name: 'BaseCardQuestInvite',
    props: {
        quest: {
            type: Object as PropType<TQuestInvite>,
            required: true,
        },
    },
    data(): { isCopied: boolean } {
        return { isCopied: false };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        inviteUrl(): string {
            const accountStore = useAccountStore();
            if (!accountStore.account) return '';
            const payload = { sub: accountStore.account.sub, poolId: accountStore.poolId, uuid: this.quest.uuid };
            const hash = window.btoa(JSON.stringify(payload));
            const url = new URL(`${accountStore.config.domain}/${this.quest.pathname || ''}`);
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
