<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Increase lock amount</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <BaseFormGroupLockAmount :value="Number(lockAmount)" @update="lockAmount = $event" />
        <BaseButtonApprove
            v-if="!isAllowanceSufficient"
            :amount="lockAmount"
            :token="{ address: address.BPTGauge, decimals: 18 }"
            :spender="address.VotingEscrow"
            @success="onClickIncreaseAmount"
        >
            Approve Transfer
        </BaseButtonApprove>
        <b-button v-else variant="success" class="w-100" :disabled="isPolling" @click="onClickIncreaseAmount">
            <b-spinner v-if="isPolling" small />
            <template v-else>Increase Amount</template>
        </b-button>
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
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { contractNetworks } from '../../config/constants';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { ChainId } from '@thxnetwork/sdk';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';
import { BigNumber } from 'ethers/lib/ethers';

export default defineComponent({
    name: 'BaseModalIncreaseAmount',
    props: {
        show: Boolean,
    },
    data() {
        return {
            WalletVariant,
            parseUnits,
            isShown: false,
            error: '',
            tabIndex: 0,
            precision: 6,
            isPolling: false,
            lockAmount: '0',
            amountApproval: '0',
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        amountInWei() {
            return parseUnits(this.lockAmount, 18);
        },
        isAllowanceSufficient() {
            if (!this.walletStore.allowances[this.address.BPTGauge]) return false;
            if (!this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow];
            return BigNumber.from(allowanceInWei).gte(this.amountInWei);
        },
        balanceBPTGauge() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return 0;
            return Number(formatUnits(this.walletStore.balances[this.address.BPTGauge], 'ether'));
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onShow() {
            this.walletStore.getApproval({ tokenAddress: this.address.BPTGauge, spender: this.address.VotingEscrow });
        },
        async onClickIncreaseAmount() {
            this.isPolling = true;

            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet');

                const amountInWei = parseUnits(String(this.lockAmount), 18);

                await this.veStore.increaseAmount(wallet, { amountInWei: amountInWei.toString() });
                await this.veStore.waitForIncreaseAmount(wallet, amountInWei);

                this.$emit('hidden');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.error = response && response.error ? response.error.message : 'Something went wrong...';
        },
    },
});
</script>
