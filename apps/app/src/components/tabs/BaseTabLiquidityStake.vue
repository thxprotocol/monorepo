<template>
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['20USDC-80THX']"
        :balance="balanceBPT"
        :value="Number(amountStake)"
        :min="0"
        :max="balanceBPT"
        class="mb-4"
        @update="amountStake = $event"
    >
        <template #label>
            <div class="d-flex align-items-center">
                <b-img
                    src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                    alt="USDC icon"
                    width="20"
                    height="20"
                    class="me-2"
                />
                USDC <span class="text-opaque ms-1">20%</span>
                <b-img
                    src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                    alt="THX icon"
                    width="20"
                    height="20"
                    class="mx-2"
                />
                THX <span class="text-opaque ms-1">80%</span>
            </div>
        </template>
    </BaseFormGroupInputTokenAmount>
    <b-button
        v-if="!accountStore.isAuthenticated"
        class="w-100"
        variant="primary"
        @click="authStore.isModalLoginShown = true"
    >
        Sign in &amp; Stake 20USDC-80THX
    </b-button>
    <BaseButtonApprove
        v-else-if="!isSufficientBPTAllowance"
        :token="{ address: address.BPT, decimals: 18 }"
        :spender="address.BPTGauge"
        :amount="amountStake"
        :disabled="!veStore.isAccepted"
        :chain-id="liquidityStore.chainId"
        @error="onError"
    >
        Approve <strong>20USDC-80THX</strong> <span class="text-opaque">(1/2)</span>
    </BaseButtonApprove>
    <BaseButtonLiquidityStake
        v-else
        :amount="parseUnits(amountStake, 18).toString()"
        @success="onLiquidityStake"
        @error="onError"
    >
        Stake <strong>20USDC-80THX</strong> <span class="text-opaque">(2/2)</span>
    </BaseButtonLiquidityStake>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '../../config/constants';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { useAuthStore } from '@thxnetwork/app/stores/Auth';
import { chainList } from '@thxnetwork/app/utils/chains';
import { BigNumber } from 'ethers/lib/ethers';
import { parseError } from '@thxnetwork/app/utils/toast';

export default defineComponent({
    name: 'BaseTabLiquidity',
    data() {
        return {
            formatUnits,
            parseUnits,
            amountStake: '0',
            errors: [] as string[],
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useWalletStore, useVeStore, useLiquidityStore),
        chainInfo() {
            return chainList[this.liquidityStore.chainId];
        },
        address() {
            return contractNetworks[this.liquidityStore.chainId];
        },
        isSufficientBPTAllowance() {
            if (!this.walletStore.allowances[this.address.BPT]) return false;
            if (!this.walletStore.allowances[this.address.BPT][this.address.BPTGauge]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.BPT][this.address.BPTGauge];
            const amountInWei = parseUnits(this.amountStake, 18);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        balanceBPT() {
            if (!this.walletStore.balances[this.address.BPT]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPT], 18)); // BPT has 18 decimals
        },
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                const balanceBPT = this.walletStore.balances[this.address.BPT];
                this.amountStake = balanceBPT ? formatUnits(balanceBPT, 18) : '0';
                this.walletStore.getApproval({
                    tokenAddress: this.address.BPT,
                    spender: this.address.BPTGauge,
                    chainId: this.liquidityStore.chainId,
                });
            },
            immediate: true,
        },
    },
    methods: {
        onLiquidityStake() {
            this.amountStake = '0';
            this.walletStore.getBalance(this.address.BPT, this.liquidityStore.chainId);
            this.walletStore.getBalance(this.address.BPTGauge, this.liquidityStore.chainId);
            this.$emit('change-tab', 2);
        },
        onError(error: Error) {
            this.errors.push(parseError(error));
        },
    },
});
</script>
