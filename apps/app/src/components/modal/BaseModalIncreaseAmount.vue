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
            :chain-id="liquidityStore.chainId"
            @success="onClickIncreaseAmount"
        >
            Approve Transfer
        </BaseButtonApprove>
        <b-button v-else variant="success" class="w-100" :disabled="isDisabled" @click="onClickIncreaseAmount">
            <b-spinner v-if="isPolling" small />
            <template v-else>Increase Amount</template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { contractNetworks } from '../../config/constants';
import { parseUnits } from 'ethers/lib/utils';
import { ChainId } from '@thxnetwork/common/enums';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';
import { BigNumber } from 'ethers/lib/ethers';

export default defineComponent({
    name: 'BaseModalIncreaseAmount',
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
        isDisabled() {
            return this.isPolling || this.balanceBPTGauge.lt(this.amountInWei) || this.balanceBPTGauge.eq(0);
        },
        address() {
            return contractNetworks[this.liquidityStore.chainId];
        },
        amountInWei() {
            return parseUnits(this.lockAmount, 18);
        },
        balanceBPTGauge() {
            return BigNumber.from(this.walletStore.balances[this.address.BPTGauge]);
        },
        isAllowanceSufficient() {
            if (!this.walletStore.allowances[this.address.BPTGauge]) return false;
            if (!this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow]) return false;
            const allowanceInWei = this.walletStore.allowances[this.address.BPTGauge][this.address.VotingEscrow];
            return BigNumber.from(allowanceInWei).gte(this.amountInWei);
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onShow() {
            this.walletStore.getApproval({
                tokenAddress: this.address.BPTGauge,
                spender: this.address.VotingEscrow,
                chainId: this.liquidityStore.chainId,
            });
        },
        async onClickIncreaseAmount() {
            this.isPolling = true;

            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet');

                const amountInWei = parseUnits(String(this.lockAmount), 18);
                await this.veStore.increaseAmount(wallet, { amountInWei: amountInWei.toString() });

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
