<template>
    <b-modal v-model="show" @hidden="$emit('hidden')" @show="onShow" centered hide-footer title="Unlock 20USDC-80THX">
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
            @click="onClickWithdraw"
            class="w-100"
            :disabled="isPolling || (isEarly && !isEarlyAttempt)"
        >
            <b-spinner v-if="isPolling" small />
            <template v-else>Withdraw</template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { MAX_LOCK_TIME } from '../../config/constants';
import { fromWei } from 'web3-utils';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { calculatePenalty, toFiatPrice } from '@thxnetwork/campaign/utils/price';

export default defineComponent({
    name: 'BaseModalWithdraw',
    data() {
        return {
            error: '',
            isPolling: false,
            isEarlyAttempt: false,
            toFiatPrice,
        };
    },
    props: {
        show: Boolean,
        isEarly: Boolean,
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        penaltyInWei() {
            const lock = this.veStore.lock;
            if (!lock) return 0;

            const end = Math.floor(lock.end / 1000);
            const now = Math.floor(lock.now / 1000);

            return calculatePenalty(Number(lock.amount), 1, end - now, MAX_LOCK_TIME);
        },
        penalty() {
            const price = this.liquidityStore.pricing['20USDC-80THX'];
            const penaltyInBPT = fromWei(this.penaltyInWei.toString());

            return Number(penaltyInBPT) * price;
        },
        withdrawAmount() {
            const lock = this.veStore.lock;
            if (!lock) return 0;
            return Number(lock.amount) - this.penalty;
        },
    },
    methods: {
        async onShow() {
            //
        },
        async waitForWithdrawal() {
            //
        },
        async onClickWithdraw() {
            this.isPolling = true;

            try {
                await this.veStore.withdraw(this.isEarlyAttempt);
                await this.waitForWithdrawal();

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
