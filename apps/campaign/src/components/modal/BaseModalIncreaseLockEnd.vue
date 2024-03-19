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
            <template v-else>Increase Amount</template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '@thxnetwork/campaign/stores/Liquidity';
import { BigNumber } from 'ethers/lib/ethers';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseModalIncreaseLockEnd',
    props: {
        show: Boolean,
        isEarly: Boolean,
    },
    data() {
        return {
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
        async waitForIncrease() {
            const taskFn = async () => {
                await this.veStore.getLocks();
                return BigNumber.from(this.veStore.lock.amount).eq(0) ? Promise.resolve() : Promise.reject('x');
            };
            return poll({ taskFn, interval: 3000, retries: 20 });
        },
        async onClickIncreaseLockEnd() {
            this.isPolling = true;

            try {
                await this.veStore.increasUnlockTime({ lockEndTimestamp: this.lockEnd });
                await this.waitForIncrease();

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
