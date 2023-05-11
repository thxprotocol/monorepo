<template>
    <b-alert v-if="accountStore.isAuthenticated && isWaitingForWalletAddress" variant="info" show class="p-2">
        <span>Preparing your smart wallet...</span>
        <div class="d-flex justify-content-between align-items-center">
            <b-progress
                class="w-100 my-2"
                style="height: 0.5rem"
                :value="pollingProgress"
                :max="100"
                animated
            ></b-progress>
            <b-link v-if="pollingProgress === 100" variant="primary" @click="onClickStartPolling" block class="ms-2">
                <i class="fas fa-redo-alt"></i>
            </b-link>
        </div>
    </b-alert>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useWalletStore } from '../stores/Wallet';
import { useAccountStore } from '../stores/Account';
import { mapStores } from 'pinia';
import poll from 'promise-poller';

export default defineComponent({
    name: 'BaseAlertWalletAddress',
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        isWaitingForWalletAddress() {
            const { wallet } = useWalletStore();
            return !wallet || !wallet.address;
        },
    },
    data() {
        return { pollingRetries: 10, pollingInterval: 3000, pollingProgress: 0 };
    },
    async mounted() {
        await this.walletStore.getWallet();
        this.waitForWallet();
    },
    methods: {
        waitForWallet() {
            const taskFn = async () => {
                await this.walletStore.getWallet();
                return !this.isWaitingForWalletAddress
                    ? Promise.resolve()
                    : Promise.reject('Could not find wallet address...');
            };

            poll({
                taskFn,
                interval: this.pollingInterval,
                retries: this.pollingRetries,
                progressCallback: this.onProgressCallback,
            });
        },
        onClickStartPolling() {
            this.pollingProgress = 0;
            this.waitForWallet();
        },
        onProgressCallback(retriesRemaining: number) {
            this.pollingProgress = 100 - ((retriesRemaining - 1) / this.pollingRetries) * 100;
        },
    },
});
</script>
