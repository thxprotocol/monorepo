<template>
    <b-modal v-model="show" @hidden="$emit('hidden')" @show="onShow" centered hide-footer title="Unlock 20USDC-80THX">
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <b-tabs v-model="tabIndex" pills justified content-class="mt-3" nav-wrapper-class="text-white">
            <b-tab title="1. Lock">
                <p class="text-opaque">A penalty is applied to early withdraws.</p>
                <b-form-group v-if="isEarly">
                    <b-form-checkbox v-model="isEarlyAttempt"> I accept a penalty of {{ penalty }} </b-form-checkbox>
                </b-form-group>
                <p v-else>You are ready to unlock (or relock!)</p>
                <b-button
                    variant="primary"
                    @click="tabIndex = 1"
                    class="w-100"
                    :disabled="isPolling || (isEarly && !isEarlyAttempt)"
                >
                    Continue
                </b-button>
            </b-tab>
            <b-tab title="2. Withdraw">
                <p>{{ withdrawAmount }}</p>
                <b-button variant="primary" @click="onClickWithdraw" class="w-100" :disabled="isPolling">
                    <b-spinner v-if="isPolling" small />
                    <template v-else>Withdraw</template>
                </b-button>
            </b-tab>
        </b-tabs>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { MAX_LOCK_TIME } from '../../config/constants';

function calculatePenalty(lockAmount: number, penaltyCoefficient = 1, leftTimeToUnlock: number, maxLockTime: number) {
    if (penaltyCoefficient < 0 || penaltyCoefficient > 5) {
        throw new Error('penaltyCoefficient must be between 0 and 5');
    }
    if (leftTimeToUnlock < 0 || maxLockTime <= 0) {
        throw new Error(
            'Invalid time values. leftTimeToUnlock should be non-negative, and maxLockTime should be positive',
        );
    }

    // Ensure leftTimeToUnlock does not exceed maxLockTime
    leftTimeToUnlock = Math.min(leftTimeToUnlock, maxLockTime);

    return lockAmount * penaltyCoefficient * (leftTimeToUnlock / maxLockTime);
}

export default defineComponent({
    name: 'BaseModalWithdraw',
    data() {
        return {
            error: '',
            isPolling: false,
            tabIndex: 0,
            isEarlyAttempt: false,
        };
    },
    props: {
        show: Boolean,
        isEarly: Boolean,
    },
    computed: {
        ...mapStores(useWalletStore),
        ...mapStores(useVeStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        penalty() {
            const lock = this.veStore.lock;
            if (!lock) return 0;

            const end = Math.floor(lock.end / 1000);
            const now = Math.floor(lock.now / 1000);

            try {
                return calculatePenalty(Number(lock.amount), 1, end - now, MAX_LOCK_TIME);
            } catch (error) {
                return 0;
            }
        },
        withdrawAmount() {
            const lock = this.veStore.lock;
            if (!lock) return 0;
            return Number(lock.amount) - this.penalty;
        },
    },
    watch: {
        tabIndex() {
            this.error = '';
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

                // Wait for allowance to increase to the suffucient
                // amount for this deposit.
                await this.waitForWithdrawal();

                // Next tab view
                this.$emit('hidden'); // Or display a message and change to a close button
            } catch (response) {
                this.onError(response);
            } finally {
                this.isPolling = false;
            }
        },
        onError(response: any) {
            console.log(response);
            this.error = response && response.error ? response.error.message : 'Something went wrong...';
        },
    },
});
</script>
