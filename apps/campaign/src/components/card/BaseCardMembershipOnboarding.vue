<template>
    <b-card class="border-0 gradient-shadow-xl">
        <BaseFormGroupInputTokenAmount
            :usd="token ? token.price : 0"
            :balance="token ? Number(formatUnits(token.balance, token.decimals)) : 0"
            :value="Number(amount)"
            :min="0"
            :max="token ? Number(formatUnits(token.balance, token.decimals)) : 0"
            class="mb-4"
            @update="amount = $event"
        >
            <template v-if="token" #label>
                <b-img :src="token?.logoImgURL" :alt="`${token.symbol} icon`" width="20" height="20" class="me-2" />
                <span style="font-size: 1rem">{{ token.symbol }}</span>
                <b-button variant="primary" size="sm" class="ms-2" @click="isModalTokenSelectShown = true">
                    <i class="fas fa-chevron-down text-opaque" />
                </b-button>
            </template>
        </BaseFormGroupInputTokenAmount>
        <BaseModalTokenSelect
            :show="isModalTokenSelectShown"
            :token="address.THX"
            :tokens="tokens"
            @change="onChangeToken"
            @hidden="isModalTokenSelectShown = false"
        />
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
            v-if="token"
            :show="isModalMembershipCreateShown"
            :amount="amount"
            :token="token"
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
            amount: '0',
            formatUnits,
            token: {
                symbol: 'THX',
                logoImgURL: 'https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png',
                decimals: 18,
                address: contractNetworks[ChainId.Polygon].THX,
                balance: '0',
                value: 0,
                price: 0,
            },
            lockEnd: new Date(),
            isPolling: false,
            isModalTokenSelectShown: false,
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
        tokens() {
            return [
                {
                    symbol: 'THX',
                    logoImgURL: 'https://assets.coingecko.com/coins/images/21323/standard/logo-thx-resized-200-200.png',
                    decimals: 18,
                    address: this.address.THX,
                    balance: this.walletStore.balances[this.address.THX] || '0',
                    value: this.walletStore.balances[this.address.THX]
                        ? Number(formatUnits(this.walletStore.balances[this.address.THX], 18)) *
                          this.liquidityStore.pricing['THX']
                        : 0,
                    price: this.liquidityStore.pricing['THX'],
                },
                {
                    symbol: 'USDC.e',
                    logoImgURL: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
                    decimals: 6,
                    address: this.address.USDC,
                    balance: this.walletStore.balances[this.address.USDC] || '0',
                    value: this.walletStore.balances[this.address.USDC]
                        ? Number(formatUnits(this.walletStore.balances[this.address.USDC], 6)) *
                          this.liquidityStore.pricing['USDC']
                        : 0,
                    price: this.liquidityStore.pricing['USDC'],
                },
            ];
        },
        isButtonMemberschipCreateDisabled() {
            return !Number(this.amount);
        },
    },
    watch: {
        'walletStore.wallet': {
            handler(wallet) {
                if (!wallet) return;
                this.walletStore.getBalance(this.address.THX).then(() => {
                    this.amount = formatUnits(this.walletStore.balances[this.address.THX], 18);
                    this.token = this.tokens[0];
                });
                this.walletStore.getBalance(this.address.USDC);
            },
            immediate: true,
        },
    },
    methods: {
        async onChangeToken(token: TToken) {
            this.token = token;
            this.isModalTokenSelectShown = false;
        },
    },
});
</script>
