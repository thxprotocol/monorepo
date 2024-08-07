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

        <b-alert v-model="isEarlyAlertShown" class="p-2" variant="primary">
            <i class="fas fa-info-circle me-1" />
            A penalty will be applied on early withdrawals!
        </b-alert>
        <p class="text-opaque">
            This penalty will be subtracted from your locked amount and redistributed to other lockers as rewards.
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
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { calculatePenalty, toFiatPrice } from '@thxnetwork/app/utils/price';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';
import { track } from '@thxnetwork/app/utils/mixpanel';
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
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore, useAccountStore),
        isAlertInfoShown() {
            return !!this.error;
        },
        isEarlyAlertShown() {
            return this.isEarly;
        },
        penaltyInWei() {
            const end = Math.floor(this.veStore.lock.end / 1000);
            const now = Math.floor(this.veStore.now / 1000);
            return calculatePenalty(this.veStore.lock.amount, 1, end - now, MAX_LOCK_TIME);
        },
        penalty() {
            return (this.penaltyInWei * this.liquidityStore.pricing['20USDC-80THX']) / 10 ** 18;
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

                this.walletStore.getBalance(
                    contractNetworks[this.liquidityStore.chainId].BPTGauge,
                    this.liquidityStore.chainId,
                );

                this.trackEvent({ isEarly: this.isEarly, isEarlyAttempt: this.isEarlyAttempt });
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
        trackEvent(data: any) {
            const { poolId, account } = this.accountStore;
            const { wallet } = this.walletStore;
            track('UserCreates', [account?.sub, 'withdrawal', { poolId, address: wallet?.address, ...data }]);
        },
    },
});
</script>
