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
        <p class="text-opaque">
            Current: <strong>{{ format(new Date(veStore.lock.end), 'MMMM do yyyy hh:mm:ss') }}</strong>
        </p>
        <b-button variant="primary" class="w-100" :disabled="isDisabled" @click="onClickIncreaseLockEnd">
            <b-spinner v-if="isPolling" small />
            <template v-else>Increase End Date</template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '@thxnetwork/app/stores/Liquidity';
import { WalletVariant } from '@thxnetwork/app/types/enums/accountVariant';
import { format } from 'date-fns';
import { getThursdaysUntilTimestamp, NinetyDaysInMs } from '@thxnetwork/app/utils/date';
import { ChainId } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'BaseModalIncreaseLockEnd',
    props: {
        show: Boolean,
        isEarly: Boolean,
        chainId: { type: Number as PropType<ChainId>, required: true },
    },
    data() {
        return {
            format,
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
        isDisabled() {
            const availableDates = getThursdaysUntilTimestamp(this.veStore.lock.end, this.veStore.now + NinetyDaysInMs);
            return this.isPolling || !this.lockEnd || !availableDates.length;
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
                await this.veStore.increasUnlockTime(wallet, { lockEndTimestamp, chainId: this.chainId });

                this.$emit('hidden');
            } catch (response) {
                console.error(response);
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
