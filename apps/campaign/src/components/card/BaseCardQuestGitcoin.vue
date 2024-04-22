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

        <BaseFormGroupWalletSelect
            v-if="accountStore.isAuthenticated"
            description="Add or connect the wallet you will use for this quest."
            :variants="[WalletVariant.WalletConnect]"
            @update="onUpdate"
        />

        <template #button>
            <b-button variant="primary" class="w-100" :disabled="isSubmitting" @click="onClickSign">
                <b-spinner v-if="isSubmitting" small />
                <template v-else>
                    Claim
                    <strong>{{ quest.amount }}</strong>
                    points
                </template>
            </b-button>
        </template>
    </BaseCardQuest>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useQuestStore } from '../../stores/Quest';
import { useWalletStore } from '../../stores/Wallet';
import { ChainId } from '@thxnetwork/sdk';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';
import imgLogoGitcoin from '../../assets/gitcoin-logo.svg';

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
            WalletVariant,
            isModalQuestEntryShown: false,
            imgLogoGitcoin,
            error: '',
            isSubmitting: false,
            show: false,
            message:
                'This signed message will be used to proof ownership of your web3 account and verify the quest requirements.',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
        isAlertDangerShown() {
            return !!this.error && !this.isSubmitting;
        },
    },
    mounted() {
        if (!this.quest.isAvailable) return;
    },
    methods: {
        onUpdate(wallet: TWallet) {
            this.walletStore.setWallet(wallet, true);
        },
        async onClickSign() {
            this.error = '';
            this.isSubmitting = true;
            try {
                const signature = await this.walletStore.signMessage(this.message);
                await this.questStore.completeQuest(this.quest, {
                    signature,
                    message: this.message,
                    chainId: ChainId.Polygon,
                });
                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = (error as Error).message;
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
