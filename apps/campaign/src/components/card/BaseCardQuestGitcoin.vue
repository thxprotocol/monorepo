<template>
    <BaseCardQuest
        :id="quest._id"
        :quest="quest"
        :visible="!!accountStore.isAuthenticated && quest.isAvailable"
        :loading="isSubmitting"
        :completing="isModalQuestEntryShown"
        :error="error"
        @modal-close="isModalQuestEntryShown = false"
    >
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
            <BaseButtonWalletConnect
                message="This signed message will be used to proof ownership of your web3 account and verify the quest requirements."
                @signed="onSigned"
                @error="error = $event"
            >
                Claim <strong>{{ quest.amount }}</strong> points
            </BaseButtonWalletConnect>
        </template>
    </BaseCardQuest>
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
