<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Unlock 20USDC-80THX</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <p class="text-opaque">
            A penalty is applied to early withdraws. This penalty will be subtracted from your locked amount and
            redistributed as rewards.
        </p>
        <b-form-group v-if="isEarly">
            <b-form-checkbox v-model="isEarlyAttempt">
                I accept a penalty of {{ toFiatPrice(penalty) }}
            </b-form-checkbox>
        </b-form-group>
        <p v-else>You are ready to unlock (or relock!)</p>
        <b-button
            variant="primary"
            class="w-100"
            :disabled="isPolling || (isEarly && !isEarlyAttempt)"
            @click="onClickWithdraw"
        >
            <b-spinner v-if="isPolling" small />
            <template v-else>Withdraw</template>
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
import { MAX_LOCK_TIME, contractNetworks } from '../../config/constants';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { calculatePenalty, toFiatPrice } from '@thxnetwork/app/utils/price';
import { formatUnits } from 'ethers/lib/utils';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalWithdraw',
    props: {
        show: Boolean,
        isEarly: Boolean,
    },
    data() {
        return {
            WalletVariant,
            isShown: false,
            error: '',
            isPolling: false,
            isEarlyAttempt: false,
            toFiatPrice,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        penaltyInWei() {
            const end = Math.floor(this.veStore.lock.end / 1000);
            const now = Math.floor(this.veStore.now / 1000);
            return calculatePenalty(this.veStore.lock.amount, 1, end - now, MAX_LOCK_TIME);
        },
        penalty() {
            const penaltyInUSDC = this.penaltyInWei * this.liquidityStore.pricing['20USDC-80THX'];
            return Number(formatUnits(String(penaltyInUSDC), 18));
        },
        withdrawAmount() {
            const lock = this.veStore.lock;
            if (!lock) return 0;
            return Number(lock.amount) - Number(this.penalty);
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        async onShow() {
            //
        },
        async onClickWithdraw() {
            this.isPolling = true;

            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet');

                await this.veStore.withdraw(wallet, this.isEarlyAttempt);
                await this.veStore.waitForWithdrawal(wallet);

                this.walletStore.getBalance(contractNetworks[wallet.chainId].BPTGauge);

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
