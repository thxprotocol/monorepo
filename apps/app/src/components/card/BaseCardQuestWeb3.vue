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
            <b-form-group label="Available On">
                <div v-for="contract of quest.contracts" class="d-inline-flex ms-2 align-items-center">
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
        </blockquote>

        <BaseFormGroupWalletSelect
            v-if="accountStore.isAuthenticated"
            description="Add or connect the wallet you will use for this quest."
            :wallet="walletStore.wallet"
            :variants="[WalletVariant.WalletConnect]"
            @update="onUpdate"
        />

        <template #button>
            <b-button variant="primary" class="w-100" :disabled="isDisabled" @click="onClickSign">
                <b-spinner v-if="isSubmitting" small />
                <template v-else-if="quest.amount">
                    Claim
                    <strong>{{ quest.amount }} points</strong>
                </template>
                <template v-else>Complete Quest</template>
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
import { chainList, getAddressURL } from '../../utils/chains';
import { ChainId } from '@thxnetwork/common/enums';
import { useWalletStore } from '@thxnetwork/app/stores/Wallet';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';

export default defineComponent({
    name: 'BaseCardQuestWeb3',
    props: {
        quest: {
            type: Object as PropType<TQuestWeb3>,
            required: true,
        },
    },
    data() {
        return {
            WalletVariant,
            error: '',
            message: '',
            isSubmitting: false,
            walletVariants: [WalletVariant.WalletConnect],
            chainList,
            getAddressURL,
            chainId: ChainId.Polygon,
            isModalQuestEntryShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
        isDisabled() {
            return (
                this.isSubmitting ||
                !this.walletStore.wallet ||
                !this.walletVariants.includes(this.walletStore.wallet.variant)
            );
        },
    },
    mounted() {
        if (!this.quest.isAvailable) return;
        this.chainId = this.quest.contracts[0].chainId;
        this.message = `This signature will be used to validate if the result of calling ${this.quest.methodName} on chain ${this.chainId} with the address used to sign this message is above the threshold of ${this.quest.threshold}.`;
    },
    methods: {
        onUpdate(wallet: TWallet | null) {
            this.walletStore.setWallet(wallet);
        },
        async onClickSign() {
            this.error = '';
            this.isSubmitting = true;
            try {
                const signature = await this.walletStore.signMessage(this.message);
                await this.questStore.completeQuest(this.quest, {
                    signature,
                    message: this.message,
                    chainId: this.chainId,
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
