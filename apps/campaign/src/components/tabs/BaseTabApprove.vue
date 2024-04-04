<template>
    <b-form-group label="Amount" :description="`Current allowance: ${currentAllowance}`">
        <b-form-input :value="amount" type="number" :step="0.1 ** precision" @input="$emit('update', $event)" />
    </b-form-group>
    <b-button v-if="isSufficientAllowance" variant="primary" class="w-100" :disabled="isPolling" @click="$emit('ok')">
        Continue
    </b-button>
    <b-button v-else variant="primary" class="w-100" :disabled="isPolling" @click="onClickApprove">
        <b-spinner v-if="isPolling" small />
        <template v-else>Approve</template>
    </b-button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers/lib/ethers';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseTabApprove',
    props: {
        amount: { type: String, required: true },
        tokenAddress: { type: String, required: true },
        spender: { type: String, required: true },
    },
    data() {
        return {
            error: '',
            isPolling: false,
            precision: 6,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        allowance() {
            if (!this.walletStore.allowances[this.tokenAddress]) return 0;
            if (!this.walletStore.allowances[this.tokenAddress][this.spender]) return 0;
            return this.walletStore.allowances[this.tokenAddress][this.spender];
        },
        currentAllowance() {
            return Number(formatUnits(this.allowance, 'ether'));
        },
        isSufficientAllowance() {
            const allowanceInWei = BigNumber.from(this.allowance);
            const amountInWei = parseUnits(this.amount.toString(), 18);
            if (amountInWei.gt(0) && allowanceInWei.gte(amountInWei)) return true;
            return false;
        },
    },
    methods: {
        waitForApproval() {
            const taskFn = async () => {
                await this.walletStore.getApproval({
                    tokenAddress: this.tokenAddress,
                    spender: this.spender,
                });
                return this.isSufficientAllowance ? Promise.resolve() : Promise.reject('x');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickApprove() {
            this.isPolling = true;
            try {
                const amountInWei = parseUnits(this.amount.toString(), 18);

                await this.walletStore.approve({
                    tokenAddress: this.tokenAddress,
                    spender: this.spender,
                    amountInWei: amountInWei.toString(),
                });

                // poll for allowance to increase
                await this.waitForApproval();

                this.$emit('approve');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.error = response && response.error ? response.error.message : response.message;
        },
    },
});
</script>
