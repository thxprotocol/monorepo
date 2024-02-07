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
            <b-button v-if="!accountStore.isAuthenticated" @click="onClickSignin" variant="primary" block class="w-100">
                Sign in &amp; claim <strong>{{ quest.amount }} points</strong>
            </b-button>

            <b-button v-else-if="!quest.isAvailable" variant="primary" block class="w-100" disabled>
                Quest Completed
            </b-button>

            <BaseButtonQuestLocked v-else-if="quest.isLocked" :quest="quest" />

            <b-button v-else variant="primary" block class="w-100" @click="onClickClaim">
                Claim <strong>{{ quest.amount }}</strong> points
            </b-button>
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useAuthStore } from '../../stores/Auth';
import { useQuestStore } from '../../stores/Quest';
import { getModal } from '../../utils/wallet-connect';
import { chainList, getAddressURL } from '../../utils/chains';
import { getAccount, GetAccountResult, PublicClient } from '@wagmi/core';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { signMessage } from '@wagmi/core';
import { Web3Modal } from '@web3modal/html';
import imgLogoGitcoin from '../../assets/gitcoin-logo.svg';

export default defineComponent({
    name: 'BaseCardQuestGitcoin',
    props: {
        quest: {
            type: Object as PropType<TQuestGitcoin>,
            required: true,
        },
    },
    data(): {
        imgLogoGitcoin: string;
        account: GetAccountResult<PublicClient> | null;
        modal: Web3Modal | null;
        error: string;
        isModalOpen: boolean;
        isSubmitting: boolean;
        chainList: { [chainId: number]: ChainInfo };
        getAddressURL: any;
        show: boolean;
        chainId: ChainId;
        unsubscribe: any;
        isModalQuestEntryShown: boolean;
    } {
        return {
            imgLogoGitcoin,
            error: '',
            account: null,
            modal: null,
            isModalOpen: false,
            isSubmitting: false,
            chainList,
            getAddressURL,
            show: false,
            chainId: ChainId.Polygon,
            unsubscribe: null,
            isModalQuestEntryShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        isAlertDangerShown() {
            return !!this.error && !this.isSubmitting;
        },
        accountStatus() {
            if (!this.account) return 'text-opaque';
            switch (this.account.status) {
                case 'connected':
                    return 'text-success';
                case 'connecting':
                    return 'text-warning';
                case 'disconnected':
                    return 'text-danger';
                default:
                    return 'text-opaque';
            }
        },
    },
    mounted() {
        if (!this.quest.isAvailable) return;
        const chains = [chainList[ChainId.Polygon].chain];
        const theme = this.accountStore.getTheme();
        this.chainId = ChainId.Polygon;
        this.modal = getModal(chainList[this.chainId].chain, chains, theme);
        this.unsubscribe = this.modal.subscribeModal(this.onModalStateChange);
    },
    methods: {
        onModalStateChange({ open }: { open: boolean }) {
            this.isModalOpen = open;
            this.account = getAccount();
        },
        onClickSignin: function () {
            this.accountStore.signin();
        },
        waitForConnected() {
            return new Promise((resolve) => {
                setInterval(() => {
                    if (this.account?.isConnected) resolve('connected');
                }, 500);
            });
        },
        onClickClaim: async function () {
            if (!this.modal) return;

            this.error = '';
            this.isSubmitting = true;

            try {
                this.modal.setDefaultChain(this.chainList[this.chainId].chain);
                await this.modal.openModal();
                await this.waitForConnected();

                const message = `This signature will be used to proof ownership of a web3 account.`;
                const signature = await signMessage({ message });

                await this.questStore.completeGitcoinQuest(this.quest, {
                    signature,
                    message,
                    chainId: this.chainId,
                });

                this.isModalQuestEntryShown = true;
            } catch (error) {
                this.error = error as string;
                this.modal.closeModal();
            } finally {
                this.isSubmitting = false;
            }
        },
    },
});
</script>
