<template>
    <b-row>
        <b-col>
            <b-form-group label="Voting power" label-class="text-opaque">
                {{ fromWei(String(veStore.balance)) }}
            </b-form-group>
            <b-form-group label="Locked amount" label-class="text-opaque">
                {{ amount }}
                <b-link
                    size="sm"
                    class="text-accent text-decoration-underline ms-2"
                    @click="isModalIncreaseAmountShown = true"
                >
                    Increase
                </b-link>
                <BaseModalIncreaseAmount
                    :show="isModalIncreaseAmountShown"
                    @hidden="isModalIncreaseAmountShown = false"
                />
            </b-form-group>
            <b-form-group label="Locked ends" label-class="text-opaque">
                {{ differenceInDays(veStore.lock.end, veStore.now) }} days
                <i
                    v-b-tooltip
                    :title="`${format(new Date(veStore.lock.end), 'MMMM do yyyy hh:mm:ss')}`"
                    class="fas fa-info-circle me-1 cursor-pointer text-opaque"
                />
                <b-link
                    size="sm"
                    class="text-accent text-decoration-underline ms-2"
                    @click="isModalIncreaseLockEndShown = true"
                >
                    Increase
                </b-link>
                <BaseModalIncreaseLockEnd
                    :show="isModalIncreaseLockEndShown"
                    @hidden="isModalIncreaseLockEndShown = false"
                />
            </b-form-group>
        </b-col>
        <b-col class="d-flex align-items-center justify-content-center flex-column">
            <BaseCardMembership />
        </b-col>
    </b-row>
    <hr />
    <b-alert v-model="isEarly" class="p-2" variant="primary">
        <i class="fas fa-info-circle me-1" />
        A penalty will be applied on early withdrawals!
    </b-alert>
    <b-button class="w-100" variant="primary" @click="isModalWithdrawShown = true"> Withdraw </b-button>
    <BaseModalWithdraw :show="isModalWithdrawShown" :is-early="isEarly" @hidden="isModalWithdrawShown = false" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { format, differenceInDays } from 'date-fns';
import { contractNetworks } from '../../config/constants';
import { fromWei } from 'web3-utils';
import { ChainId } from '@thxnetwork/sdk';

export default defineComponent({
    name: 'BaseTabWithdraw',
    data() {
        return {
            fromWei,
            format,
            error: '',
            differenceInDays,
            isModalIncreaseAmountShown: false,
            isModalIncreaseLockEndShown: false,
            isModalWithdrawShown: false,
            isLoadingAmount: false,
            isLoadingLockEnd: false,
            lockAmount: '0',
            lockEnd: Date.now(),
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore, useVeStore, useLiquidityStore),
        address() {
            if (!this.walletStore.wallet) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.wallet.chainId];
        },
        isEarly() {
            if (!this.veStore.lock) return;
            return Number(this.veStore.now) < Number(this.veStore.lock.end);
        },
        amount() {
            if (!this.veStore.lock) return;
            return fromWei(String(this.veStore.lock.amount));
        },
    },
    methods: {
        async onClickIncreaseLockEnd() {
            this.isLoadingLockEnd = true;
            try {
                const wallet = this.walletStore.wallet;
                if (!wallet) throw new Error('Please connect a wallet ');
                await this.veStore.increasUnlockTime(wallet, { lockEndTimestamp: this.lockEnd });
            } catch (error) {
                this.error = (error as any).toSTring();
            } finally {
                this.isLoadingLockEnd = false;
            }
        },
    },
});
</script>
