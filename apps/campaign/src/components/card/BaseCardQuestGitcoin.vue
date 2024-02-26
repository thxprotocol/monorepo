<template>
    <BaseCardCollapse
        @modal-close="isModalQuestEntryShown = false"
        :quest="quest"
        :id="quest._id"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :amount="quest.amount"
        :error="error"
        :image="quest.image"
        :info-links="quest.infoLinks"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
    >
        <template #header>
            <div class="d-flex align-items-center justify-content-center" style="width: 25px">
                <i class="fas fa-fingerprint me-2 text-primary"></i>
            </div>
            <div class="flex-grow-1 pe-2">{{ quest.title }}</div>
            <div class="text-accent fw-bold">{{ quest.amount }}</div>
        </template>

        <b-alert class="p-2" v-model="isAlertDangerShown" variant="danger">
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <b-card-text v-if="quest.description" style="white-space: pre-line" v-html="quest.description" />

        <blockquote>
            <div class="d-flex align-items-center">
                <b-img :src="imgLogoGitcoin" class="ms-1 me-3" />
                <p class="mb-0">
                    <span class="text-opaque">Your address is verified with Gitcoin's </span>
                    <code>Unique Humanity</code> <span class="text-opaque">scorer.</span>
                </p>
            </div>
            <hr class="mt-2 mb-1" />
            <div class="text-center">
                <b-link
                    class="text-opaque ms-auto text-decoration-none"
                    target="_blank"
                    href="https://passport.gitcoin.co"
                >
                    Create Gitcoin Passport
                    <i class="fas fa-external-link-alt ms-1" />
                </b-link>
            </div>
        </blockquote>

        <template #button>
            <b-button
                v-if="!accountStore.isAuthenticated"
                v-b-modal="'modalLogin'"
                variant="primary"
                block
                class="w-100"
            >
                Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
            </b-button>

            <b-button v-else-if="!quest.isAvailable" variant="primary" block class="w-100" disabled>
                Quest Completed
            </b-button>

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :locks="quest.locks" :id="quest._id" />

            <BaseButtonWalletConnect
                v-else
                @signed="onSigned"
                @error="error = $event"
                message="This signed message will be used to proof ownership of your web3 account and verify the quest requirements."
            >
                Claim <strong>{{ quest.amount }}</strong> points
            </BaseButtonWalletConnect>
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useQuestStore } from '../../stores/Quest';
import imgLogoGitcoin from '../../assets/gitcoin-logo.svg';
import { ChainId } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'BaseCardQuestGitcoin',
    props: {
        quest: {
            type: Object as PropType<TQuestGitcoin>,
            required: true,
        },
    },
    data() {
        return {
            isModalQuestEntryShown: false,
            imgLogoGitcoin,
            error: '',
            isSubmitting: false,
            show: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore),
        isAlertDangerShown() {
            return !!this.error && !this.isSubmitting;
        },
    },
    mounted() {
        if (!this.quest.isAvailable) return;
    },
    methods: {
        onClickSignin: function () {
            this.accountStore.signin();
        },
        async onSigned({ signature, message }: { signature: string; message: string; address: string }) {
            this.error = '';
            this.isSubmitting = true;
            try {
                await this.questStore.completeGitcoinQuest(this.quest, {
                    signature,
                    message,
                    chainId: ChainId.Polygon,
                });
                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = error as string;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
