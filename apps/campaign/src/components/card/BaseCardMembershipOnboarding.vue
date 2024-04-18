<template>
    <b-card class="border-0 gradient-shadow-xl">
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
                <b-img
                    src="https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                    alt="USDC icon"
                    width="20"
                    height="20"
                    class="me-2"
                />
                <span style="font-size: 1rem">USDC.e</span>
                <!-- <b-button variant="primary" size="sm" class="ms-2" disabled @click="onClickTokenSelect">
                    <i class="fas fa-chevron-down text-opaque" />
                </b-button> -->
                <b-button
                    variant="primary"
                    size="sm"
                    class="ms-2"
                    :href="`${chainInfo.blockExplorer}/token/${address.USDC}`"
                    target="_blank"
                >
                    <i class="fas fa-external-link-alt text-opaque" />
                </b-button>
            </template>
        </BaseFormGroupInputTokenAmount>
        <BaseFormGroupLockEnd :value="lockEnd" @update="lockEnd = $event" />
        <b-button
            v-if="!accountStore.isAuthenticated"
            class="w-100"
            variant="success"
            @click="authStore.isModalLoginShown = true"
        >
            Sign in &amp; Add Liquidity
        </b-button>
        <b-button
            v-else
            :disabled="isButtonMemberschipCreateDisabled"
            class="w-100 mt-3"
            variant="success"
            @click="isModalMembershipCreateShown = true"
        >
            Create Membership
        </b-button>
        <BaseModalMembershipCreate
            :show="isModalMembershipCreateShown"
            :amount="amountUSDC"
            :lock-end="lockEnd"
            @hidden="isModalMembershipCreateShown = false"
        />
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { contractNetworks } from '@thxnetwork/campaign/config/constants';
import { chainList } from '@thxnetwork/campaign/utils/chains';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits } from 'ethers/lib/utils';
import { useAuthStore } from '@thxnetwork/campaign/stores/Auth';
import { useAccountStore } from '../../stores/Account';

export default defineComponent({
    name: 'BaseCardMembershipOnboarding',
    data() {
        return {
            error: '',
            amountUSDC: '0',
            lockEnd: new Date(),
            isPolling: false,
            isModalMembershipCreateShown: false,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useAuthStore, useAccountStore, useLiquidityStore),
        chainInfo() {
            if (!this.walletStore.wallet) return chainList[ChainId.Polygon];
            return chainList[this.walletStore.wallet.chainId];
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        balanceUSDC() {
            if (!this.walletStore.balances[this.address.USDC]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.USDC], 6)); // USDC.e has 6 decimals
        },
        isButtonMemberschipCreateDisabled() {
            return !Number(this.amountUSDC);
        },
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                this.walletStore.getBalance(this.address.USDC).then(() => {
                    this.amountUSDC = formatUnits(this.walletStore.balances[this.address.USDC], 6);
                });
            },
            immediate: true,
        },
    },
    methods: {
        async onClickTokenSelect() {
            //
        },
    },
});
</script>
