<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="modal-title">Lock 20USDC-80THX</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-for="error in errors" v-model="isAlertErrorShown" variant="primary" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab title="1. Approve">
                <BaseTabApprove
                    :amount="amountApproval"
                    :token="{ address: address.BPTGauge, decimals: 18 }"
                    :spender="address.VotingEscrow"
                    @update="amountApproval = $event"
                    @approve="onApprove"
                    @ok="tabIndex = 1"
                />
            </b-tab>
            <b-tab title="2. Deposit">
                <BaseFormGroupInputTokenAmount
                    :usd="liquidityStore.pricing['20USDC-80THX']"
                    :balance="Number(formatUnits(balanceInWei.toString(), 18))"
                    :value="Number(amountDeposit)"
                    :min="0"
                    :max="Number(balanceInWei.toString())"
                    :precision="precision"
                    :disabled="true"
                    class="mb-4"
                    @update="amountDeposit = $event"
                />
                <b-button variant="primary" class="w-100" :disabled="isDisabled" @click="onClickDeposit">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Deposit</template>
                </b-button>
            </b-tab>
        </b-tabs>
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
import { useLiquidityStore } from '../../stores/Liquidity';
import { contractNetworks } from '../../config/constants';
import { ChainId } from '@thxnetwork/sdk';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { roundDownFixed } from '@thxnetwork/campaign/utils/price';
import { WalletVariant } from '@thxnetwork/campaign/types/enums/accountVariant';
import { BigNumber } from 'ethers';

export default defineComponent({
    name: 'BaseModalDeposit',
    props: {
        show: Boolean,
        amount: { type: Number, required: true },
        lockEnd: { type: Date, required: true },
    },
    data() {
        return {
            formatUnits,
            WalletVariant,
            isShown: false,
            isPolling: false,
            tabIndex: 0,
            isModalDepositShown: false,
            precision: 6,
            amountApproval: '0',
            amountDeposit: '0',
            errorDeposit: '',
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertErrorShown() {
            return !!this.errors.length;
        },
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        allowanceInWei() {
            if (!this.walletStore.allowances[this.address.BPTGauge]) return BigNumber.from(0);
            if (!this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow])
                return BigNumber.from(0);
            return BigNumber.from(this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow]);
        },
        balanceInWei() {
            if (!this.walletStore.balances[this.address.BPTGauge]) return BigNumber.from(0);
            return BigNumber.from(this.walletStore.balances[this.address.BPTGauge]);
        },
        amountInWei() {
            return parseUnits(this.amountDeposit, 18);
        },
        isSufficientAllowance() {
            return this.allowanceInWei.gte(this.amountInWei);
        },
        isSufficientBalance() {
            return this.balanceInWei.gte(this.amountInWei);
        },
        isSufficientDeposit() {
            return this.amountInWei.gt(0);
        },
        isDisabled() {
            return (
                !this.isSufficientDeposit || !this.isSufficientAllowance || !this.isSufficientBalance || this.isPolling
            );
        },
        errors() {
            return [
                this.errorDeposit,
                !this.isSufficientDeposit ? 'Deposit must be greater than 0' : '',
                !this.isSufficientAllowance ? 'Insufficient 20USDC-80THX allowance' : '',
                !this.isSufficientBalance ? 'Insufficient 20USDC-80THX balance' : '',
            ].filter((error) => error);
        },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
        tabIndex() {
            this.errorDeposit = '';
        },
    },
    methods: {
        async onShow() {
            this.amountApproval = roundDownFixed(this.amount, this.precision);
            this.amountDeposit = roundDownFixed(this.amount, this.precision);
            this.walletStore.getApproval({ tokenAddress: this.address.BPTGauge, spender: this.address.VotingEscrow });
            this.walletStore.getBalance(this.address.BPTGauge);
        },
        onApprove() {
            this.amountDeposit = this.amountApproval;
            this.tabIndex = 1;
        },
        async onClickDeposit() {
            this.isPolling = true;
            try {
                // Values to send
                const amountInWei = parseUnits(this.amountDeposit.toString(), 18);
                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);

                // Make deposit
                await this.veStore.deposit({ amountInWei: amountInWei.toString(), lockEndTimestamp });

                // Wait for amount and/or endDate to be updated if it changed
                await this.veStore.waitForLock(amountInWei, lockEndTimestamp);

                this.walletStore.getBalance(this.address.BPTGauge);
                this.walletStore.getBalance(this.address.VotingEscrow);

                this.$emit('hidden');
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            this.errorDeposit =
                response && response.error
                    ? response.error.message
                    : 'An issue occured while depositing. Please try again later.';
        },
    },
});
</script>
