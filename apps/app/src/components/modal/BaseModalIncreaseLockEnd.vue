<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <strong class="text-accent">Increase lock end date</strong>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1"></i>
            {{ error }}
        </b-alert>
        <BaseFormGroupLockEnd :value="lockEnd" @update="lockEnd = $event" />
        <b-button variant="primary" class="w-100" :disabled="isPolling" @click="onClickIncreaseLockEnd">
            <b-spinner v-if="isPolling" small />
            <template v-else>Increase End Date</template>
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
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalIncreaseLockEnd',
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
            lockEnd: new Date(),
        };
    },
    computed: {
        ...mapStores(useWalletStore, useVeStore, useLiquidityStore),
        isAlertInfoShown() {
            return !!this.error;
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

        async onClickIncreaseLockEnd() {
            this.isPolling = true;

            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet first');

                const lockEndTimestamp = Math.ceil(new Date(this.lockEnd).getTime() / 1000);

                await this.veStore.increasUnlockTime(wallet, { lockEndTimestamp });
                await this.veStore.waitForIncreaseUnlockTime(wallet, lockEndTimestamp);

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
