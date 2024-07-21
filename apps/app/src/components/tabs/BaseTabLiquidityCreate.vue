<template>
    <b-alert v-model="isAlertInsufficientTokensShown" variant="primary" class="p-2">
        <i v-b-tooltip class="fas fa-info-circle me-2" />
        <strong>You don't hold any THX or USDC.e</strong><br />
        Buy THX and USDC.e at
        <b-link href="https://app.balancer.fi/#/polygon/swap" target="_blank">Balancer</b-link> and
        <b-link
            href="https://quickswap.exchange/#/swap?swapIndex=0&currency0=ETH&currency1=0x2934b36ca9A4B31E633C5BE670C8C8b28b6aA015"
            target="_blank"
        >
            Quickswap </b-link
        >.
    </b-alert>
    <BaseAlertErrorList :errors="errors" @close="errors.splice($event, 1)" />
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['USDC']"
        :balance="balanceUSDC"
        :value="Number(amountUSDC)"
        :min="0"
        :max="balanceUSDC"
        class="mb-4"
        @update="amountUSDC = $event"
    >
        <template #label>
            <div class="d-flex align-items-center" style="width: 105px">
                <b-img
                    src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                    alt="USDC icon"
                    width="20"
                    height="20"
                    class="me-2"
                />
                USDC.e
                <b-link
                    :href="`${chainInfo.blockExplorer}/token/${address.USDC}`"
                    target="_blank"
                    class="text-white text-opaque small ms-2"
                >
                    <i class="fas fa-external-link-alt" />
                </b-link>
            </div>
        </template>
    </BaseFormGroupInputTokenAmount>
    <BaseFormGroupInputTokenAmount
        :usd="liquidityStore.pricing['THX']"
        :balance="balanceTHX"
        :value="Number(amountTHX)"
        :min="0"
        :max="balanceTHX"
        class="mb-4"
        @update="amountTHX = $event"
    >
        <template #label>
            <div class="d-flex align-items-center" style="width: 80px">
                <b-img
                    src="https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png"
                    alt="THX icon"
                    width="20"
                    height="20"
                    class="me-2"
                />
                THX
                <b-link
                    :href="`${chainInfo.blockExplorer}/token/${address.THX}`"
                    target="_blank"
                    class="text-white text-opaque small ms-2"
                >
                    <i class="fas fa-external-link-alt" />
                </b-link>
            </div>
        </template>
    </BaseFormGroupInputTokenAmount>
    <b-button
        v-if="!accountStore.isAuthenticated"
        class="w-100"
        variant="primary"
        @click="authStore.isModalLoginShown = true"
    >
        Sign in &amp; Add <strong>THX</strong> or <strong>USDC.e</strong>
    </b-button>
    <BaseButtonApprove
        v-else-if="!isSufficientUSDCAllowance"
        :chain-id="liquidityStore.chainId"
        :token="{ address: address.USDC, decimals: 6 }"
        :spender="address.BalancerVault"
        :amount="amountUSDC"
        :disabled="!veStore.isAccepted"
        @error="onError"
    >
        Approve <strong>USDC.e</strong> <span class="text-opaque">(1/3)</span>
    </BaseButtonApprove>
    <BaseButtonApprove
        v-else-if="!isSufficientTHXAllowance"
        :chain-id="liquidityStore.chainId"
        :token="{ address: address.THX, decimals: 18 }"
        :spender="address.BalancerVault"
        :amount="amountTHX"
        :disabled="!veStore.isAccepted"
        @error="onError"
    >
        Approve <strong>THX</strong> <span class="text-opaque">(2/3)</span>
    </BaseButtonApprove>
    <BaseButtonLiquidityCreate
        v-else
        :amounts="[parseUnits(amountUSDC, 6).toString(), parseUnits(amountTHX, 18).toString()]"
        :tokens="[address.USDC, address.THX]"
        :slippage="slippage"
        @success="onLiquidityCreate"
        @error="onError"
    >
        Create <strong>20USDC-80THX</strong> <span class="text-opaque">(3/3)</span>
    </BaseButtonLiquidityCreate>
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
            amountUSDC: '0',
            amountTHX: '0',
            errors: [] as string[],
            slippage: 0.5,
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
        isAlertInsufficientTokensShown() {
            return this.accountStore.isAuthenticated ? !this.balanceUSDC && !this.balanceTHX : false;
        },
        isSufficientUSDCAllowance() {
            if (!this.walletStore.allowances[this.address.USDC]) return false;
            if (!this.walletStore.allowances[this.address.USDC][this.address.BalancerVault]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.USDC][this.address.BalancerVault];
            const amountInWei = parseUnits(this.amountUSDC, 6);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        isSufficientTHXAllowance() {
            if (!this.walletStore.allowances[this.address.THX]) return false;
            if (!this.walletStore.allowances[this.address.THX][this.address.BalancerVault]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.THX][this.address.BalancerVault];
            const amountInWei = parseUnits(this.amountTHX, 18);
            return BigNumber.from(allowanceInWei).gte(amountInWei);
        },
        balanceUSDC() {
            if (!this.walletStore.balances[this.address.USDC]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.USDC], 6)); // USDC.e has 6 decimals
        },
        balanceTHX() {
            if (!this.walletStore.balances[this.address.THX]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.THX], 18)); // THX has 18 decimals
        },
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                const balanceTHX = this.walletStore.balances[this.address.THX];
                const balanceUSDC = this.walletStore.balances[this.address.USDC];
                this.amountUSDC = balanceUSDC ? formatUnits(balanceUSDC, 6) : '0';
                this.amountTHX = balanceTHX ? formatUnits(balanceTHX, 18) : '0';
                this.walletStore.getApproval({
                    tokenAddress: this.address.USDC,
                    spender: this.address.BalancerVault,
                    chainId: this.liquidityStore.chainId,
                });
                this.walletStore.getApproval({
                    tokenAddress: this.address.THX,
                    spender: this.address.BalancerVault,
                    chainId: this.liquidityStore.chainId,
                });
            },
            immediate: true,
        },
    },
    methods: {
        async onLiquidityCreate() {
            this.amountUSDC = '0';
            this.amountTHX = '0';
            await this.walletStore.getBalance(this.address.BPT, this.liquidityStore.chainId);
            this.$emit('change-tab', 1);
        },
        onError(error: Error) {
            this.errors.push(parseError(error));
        },
    },
});
</script>
