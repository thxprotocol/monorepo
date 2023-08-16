<template>
    <BaseCardCollapse
        :image="reward.image"
        :info-links="reward.infoLinks"
        :visible="!!authStore.oAuthShare && !reward.isClaimed"
    >
        <template #header>
            <div class="flex-grow-1 pe-2">{{ reward.title }}</div>
            <div class="text-accent fw-bold">{{ reward.amount }}</div>
        </template>

        <b-alert class="p-2" v-model="isAlertDangerShown" variant="danger">
            <i class="fas fa-exclamation-circle me-1"></i> {{ error }}
        </b-alert>

        <b-card-text v-if="reward.description">
            {{ reward.description }}
        </b-card-text>

        <blockquote>
            <b-form-group label="Available On">
                <div class="d-inline-flex ms-2 align-items-center" v-for="contract of reward.contracts">
                    <b-img
                        :src="chainList[contract.chainId].logo"
                        width="12"
                        height="12"
                        :alt="chainList[contract.chainId].name"
                        class="me-2"
                    />

                    <b-link target="_blank" :href="getAddressURL(contract.chainId, contract.address)">
                        {{ chainList[contract.chainId].name }}
                    </b-link>
                </div>
            </b-form-group>
            <b-row>
                <b-col>
                    <b-form-group label="Method" class="mb-0">
                        <code>{{ reward.methodName }}</code>
                    </b-form-group>
                </b-col>
                <b-col>
                    <b-form-group label="Threshold" class="mb-0">
                        <code>{{ reward.threshold }}</code>
                    </b-form-group>
                </b-col>
            </b-row>
        </blockquote>

        <template #button>
            <b-button v-if="!authStore.oAuthShare" @click="onClickSignin" variant="primary" block class="w-100">
                Sign in &amp; claim <strong>{{ reward.amount }} points</strong>
            </b-button>

            <b-button v-else-if="reward.isClaimed" variant="primary" block class="w-100" disabled>
                Quest Completed
            </b-button>

            <b-button-group v-else class="w-100" block>
                <b-button variant="primary" block class="w-100" @click="onClickClaim">
                    <b-img
                        :src="chainList[chainId].logo"
                        class="me-2"
                        width="18"
                        height="18"
                        :alt="chainList[chainId].name"
                    />
                    Claim <strong>{{ reward.amount }}</strong> points
                </b-button>
                <b-dropdown right variant="primary" no-caret toggle-class="pe-3">
                    <template #button-content>
                        <i class="fas fa-caret-down"></i>
                    </template>
                    <BDropdownItem @click="chainId = contract.chainId" v-for="contract of reward.contracts">
                        <b-img
                            :src="chainList[contract.chainId].logo"
                            width="12"
                            height="12"
                            :alt="chainList[contract.chainId].name"
                            class="me-2"
                        />
                        {{ chainList[contract.chainId].name }}
                    </BDropdownItem>
                </b-dropdown>
            </b-button-group>

            <!-- <b-button
                variant="primary"
                block
                class="w-100"
                @click="onClickClaim"
                :disabled="isSubmitting || isModalOpen"
            >
                <b-spinner small v-if="isSubmitting || isModalOpen"></b-spinner>
                <template v-else>
                    Claim <strong>{{ reward.amount }} points</strong>
                </template>
            </b-button> -->
        </template>
    </BaseCardCollapse>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../stores/Account';
import { useAuthStore } from '../stores/Auth';
import { useRewardStore } from '../stores/Reward';
import { getModal } from '../utils/wallet-connect';
import { chainList, getAddressURL } from '../utils/chains';
import BaseCardCollapse from '../components/BaseCardCollapse.vue';
import { getAccount, GetAccountResult, PublicClient } from '@wagmi/core';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { Web3Modal } from '@web3modal/html';
import { signMessage } from '@wagmi/core';

export default defineComponent({
    name: 'BaseCardQuestSocial',
    components: {
        BaseCardCollapse,
    },
    props: {
        reward: {
            type: Object as PropType<TQuestWeb3>,
            required: true,
        },
    },
    data: function (): {
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
    } {
        return {
            error: '',
            account: null,
            modal: null,
            isModalOpen: false,
            isSubmitting: false,
            chainList,
            getAddressURL,
            show: false,
            chainId: ChainId.Hardhat,
            unsubscribe: null,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useRewardStore),
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
        if (this.reward.isClaimed) return;
        const chains = this.reward.contracts.map((contract: { chainId: ChainId }) => chainList[contract.chainId].chain);
        const theme = this.accountStore.getTheme();
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

                const message = `This signature will be used to validate if the result of calling ${this.reward.methodName} on chain ${this.reward.chainId} with the address used to sign this message is above the threshold of ${this.reward.threshold}.`;
                const signature = await signMessage({ message });

                await this.rewardsStore.completeWeb3Quest(this.reward.uuid, {
                    signature,
                    message,
                    chainId: this.chainId,
                });
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
