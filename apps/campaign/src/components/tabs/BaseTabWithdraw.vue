<template>
    <b-row>
        <b-col>
            <b-form-group label="Voting power" label-class="text-opaque">
                {{ fromWei(String(veStore.balance)) }}
            </b-form-group>
            <b-form-group label="Locked amount" label-class="text-opaque">
                {{ amount }}
                <b-link size="sm" class="text-accent text-decoration-underline ms-2">Increase</b-link>
            </b-form-group>
            <b-form-group label="Locked ends" label-class="text-opaque">
                {{ differenceInDays(veStore.lock.end, veStore.now) }} days
                <i
                    v-b-tooltip
                    :title="`${format(new Date(veStore.lock.end), 'MMMM do yyyy hh:mm:ss')}`"
                    class="fas fa-info-circle me-1 cursor-pointer text-opaque"
                />
                <b-link size="sm" class="text-accent text-decoration-underline ms-2">Increase</b-link>
            </b-form-group>
        </b-col>
        <b-col class="d-flex align-items-center justify-content-center flex-column">
            <div class="text-center">
                <div
                    class="position-relative rounded-circle m-auto gradient-border-xl"
                    style="width: 75px; height: 75px"
                >
                    <div
                        class="position-relative bg-dark rounded-circle d-flex align-items-center justify-content-center"
                        style="z-index: 1; width: 65px; height: 65px"
                    >
                        <i class="fas fa-id-card" style="font-size: 1.5rem" />
                    </div>
                </div>
                <b-badge class="mt-2 p-2" variant="primary">
                    {{ membership }}
                </b-badge>
            </div>
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
            differenceInDays,
            isModalStakeShown: false,
            isModalWithdrawShown: false,
            amountStake: 0,
            amountUSDC: 0,
            amountTHX: 0,
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
        membership() {
            if (!this.veStore.lock) return;
            const amount = Number(fromWei(String(this.veStore.lock.amount)));

            if (amount < 175) return 'No Rank';
            if (amount > 175 && amount < 1750) return 'Rookie';
            if (amount > 1750 && amount < 17500) return 'Elite';
            if (amount > 17500 && amount < 175000) return 'Master';
            if (amount > 175000 && amount < 1750000) return 'Legend';
        },
    },
});
</script>
