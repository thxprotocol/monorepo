<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="modal-title"><i class="fas fa-gift me-2" /> Claim your rewards</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1" />
            {{ error }}
        </b-alert>
        <b-list-group class="mb-3">
            <b-list-group-item v-for="rewardToken of rewards" class="d-flex align-items-center justify-content-between">
                <span class="text-accent me-1">
                    {{ rewardToken.amount }}
                </span>
                <span class="text-opaque">
                    {{ rewardToken.symbol }}
                </span>
                <span class="text-opaque ms-auto me-3">
                    {{ rewardToken.value }}
                    <b-link
                        v-if="walletStore.wallet"
                        :href="`${chainList[walletStore.wallet.chainId].blockExplorer}/token/${
                            rewardToken.tokenAddress
                        }?a=${walletStore.wallet.address}`"
                        target="_blank"
                    >
                        <i class="fas fa-external-link-alt text-white text-opaque ms-1 small" />
                    </b-link>
                </span>
                <b-button size="sm" variant="success" :disabled="isLoading" @click="onClickClaimRewards()">
                    Claim
                </b-button>
            </b-list-group-item>
        </b-list-group>
        <p v-if="walletStore.wallet?.variant === WalletVariant.Safe" class="text-muted text-center mt-3 mb-0">
            ❤️ We sponsor the transaction costs of your <b-link href="" class="text-white">Safe Multisig</b-link>!
        </p>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { formatUnits } from 'ethers/lib/utils';
import { roundDownFixed, toFiatPrice } from '@thxnetwork/campaign/utils/price';
import { ChainId } from '@thxnetwork/sdk';
import { chainList } from '@thxnetwork/campaign/utils/chains';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalClaimTokens',
    props: {
        show: Boolean,
    },
    data() {
        return {
            WalletVariant,
            chainList,
            ChainId,
            isAlertInfoShown: false,
            isLoading: false,
            isShown: false,
            error: '',
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore, useLiquidityStore),
        rewards() {
            return this.veStore.rewards.map((reward) => ({
                symbol: reward.symbol,
                tokenAddress: reward.tokenAddress,
                amount: roundDownFixed(Number(formatUnits(reward.amount, 'ether')), 6),
                value: this.getValue(reward.symbol, reward.amount),
            }));
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onShow() {
            //
        },
        getValue(symbol: string, amount: string) {
            const value = this.liquidityStore.pricing[symbol] * Number(formatUnits(amount, 'ether'));
            return toFiatPrice(Number(value));
        },
        async onClickClaimRewards() {
            this.isLoading = true;
            await this.veStore.claimTokens();
            this.isLoading = false;
        },
    },
});
</script>
