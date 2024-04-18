<template>
    <b-button :disabled="isDisabled" variant="primary" size="sm" class="w-100" @click="onClickApprove">
        <b-spinner v-if="isPolling" small />
        <template v-else> Approve </template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { BigNumber } from 'ethers/lib/ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useWalletStore } from '@thxnetwork/campaign/stores/Wallet';
import { mapStores } from 'pinia';
import { contractNetworks } from '@thxnetwork/campaign/config/constants';
import { ChainId } from '@thxnetwork/sdk';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseButtonApprove',
    props: {
        amount: { type: String, required: true },
        token: { type: Object as PropType<{ address: string; decimals: number }>, required: true },
        spender: { type: String, required: true },
    },
    data() {
        return {
            isPolling: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        amountInWei() {
            return parseUnits(this.amount, this.token.decimals);
        },
        allowance() {
            if (!this.walletStore.allowances[this.token.address]) return 0;
            if (!this.walletStore.allowances[this.token.address][this.spender]) return 0;
            return this.walletStore.allowances[this.token.address][this.spender];
        },
        currentAllowance() {
            return Number(formatUnits(this.allowance, this.token.decimals));
        },
        isSufficientAllowance() {
            const allowanceInWei = BigNumber.from(this.allowance);
            if (this.amountInWei.gt(0) && allowanceInWei.gte(this.amountInWei)) return true;
            return false;
        },
        isDisabled() {
            return this.isSufficientAllowance || this.isPolling;
        },
    },
    methods: {
        waitForApproval() {
            const taskFn = async () => {
                await this.walletStore.getApproval({
                    tokenAddress: this.token.address,
                    spender: this.spender,
                });
                return this.isSufficientAllowance ? Promise.resolve() : Promise.reject('x');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickApprove() {
            try {
                this.isPolling = true;

                await this.walletStore.approve({
                    tokenAddress: this.token.address,
                    spender: this.spender,
                    amountInWei: this.amountInWei.toString(),
                });

                await this.waitForApproval();

                this.$emit('success');
            } catch (error) {
                console.error(error);
            } finally {
                this.isPolling = false;
            }
        },
    },
});
</script>
