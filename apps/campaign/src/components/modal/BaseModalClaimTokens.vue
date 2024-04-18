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
        <template v-if="isAvailable">
            <b-list-group class="mb-3">
                <b-list-group-item
                    v-for="rewardToken of rewards"
                    class="d-flex align-items-center justify-content-between"
                >
                    <span class="text-accent me-1">
                        {{ rewardToken.amount }}
                    </span>
                    <span class="text-opaque">
                        {{ rewardToken.symbol }}
                    </span>
                    <b-link
                        v-if="walletStore.wallet"
                        :href="`${chainList[walletStore.wallet.chainId].blockExplorer}/token/${
                            rewardToken.tokenAddress
                        }?a=${walletStore.wallet.address}`"
                        target="_blank"
                    >
                        <i class="fas fa-external-link-alt text-white text-opaque ms-1 small" />
                    </b-link>
                    <span class="ms-auto">
                        {{ toFiatPrice(rewardToken.value) }}
                    </span>
                </b-list-group-item>
            </b-list-group>
            <b-button class="w-100" variant="primary" :disabled="isLoading" @click="onClickClaimRewards()">
                Claim Rewards
            </b-button>
            <p v-if="walletStore.wallet?.variant === WalletVariant.Safe" class="text-muted text-center mt-3 mb-0">
                ❤️ We sponsor the transaction costs of your <b-link href="" class="text-white">Safe Multisig</b-link>!
            </p>
        </template>

        <div v-else class="text-center py-5">
            <i class="fas fa-gift text-accent h1" /><br />
            <strong>You have earned no rewards yet...</strong>
            <p class="text-opaque">
                Lock liquidity to earn BAL and<br />
                20USDC-80THX rewards!
            </p>
            <b-button
                class="rounded-pill px-3"
                variant="primary"
                target="_blank"
                href="https://medium.com/thxprotocol/revolutionizing-gaming-with-thx-networks-new-vote-escrowed-tokenomics-18ef24239e46"
            >
                Learn more
                <i class="fas fa-chevron-right ms-1" />
            </b-button>
        </div>
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
            toFiatPrice,
            WalletVariant,
            chainList,
            ChainId,
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
        isAvailable() {
            const result = this.veStore.rewards
                .map(({ amount, symbol }) => this.getValue(symbol, amount))
                .reduce((a, b) => a + b, 0);
            return !!result;
        },
        isAlertInfoShown() {
            return !!this.error;
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onShow() {
            const wallet = this.walletStore.wallet;
            if (wallet) {
                this.veStore.getLocks(wallet);
            }
            this.liquidityStore.getSpotPrice();
        },
        getValue(symbol: string, amount: string) {
            const value = this.liquidityStore.pricing[symbol] * Number(formatUnits(amount, 'ether'));
            return Number(value);
        },
        async onClickClaimRewards() {
            this.isLoading = true;
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet first');

                await this.veStore.claimTokens(wallet);
            } catch (error) {
                this.error = (error as any).toString();
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
