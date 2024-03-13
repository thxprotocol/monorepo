<template>
    <div class="d-flex justify-content-center py-5" v-if="veStore.lock && !veStore.lock.end">
        <div class="flex-column text-center">
            <i class="fas fa-gift h1 text-accent"></i><br />
            <p>
                <span class="text-opaque">Lock staked liquidity and earn </span><br />
                <strong class="text-white">up to 120% APR</strong>
            </p>
            <b-button variant="primary" class="w-100" @click="$emit('change-tab', 1)"> Lock &amp; Earn </b-button>
        </div>
    </div>
    <template v-else-if="veStore.lock">
        <b-row>
            <b-col>
                <b-form-group label="Voting power" label-class="text-opaque">
                    {{ fromWei(String(veStore.balance)) }}
                </b-form-group>
                <b-form-group label="Locked amount" label-class="text-opaque">
                    {{ amount }}
                </b-form-group>
                <b-form-group label="Locked ends" label-class="text-opaque">
                    {{ differenceInDays(veStore.lock.end, veStore.lock.now) }} days
                    <i
                        v-b-tooltip
                        :title="`${format(new Date(veStore.lock.end), 'MMMM do yyyy hh:mm:ss')}`"
                        class="fas fa-info-circle me-1 cursor-pointer text-opaque"
                    />
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
                            <i class="fas fa-id-card" style="font-size: 1.5rem"></i>
                        </div>
                    </div>
                    <b-badge class="mt-2 p-2" variant="primary"> {{ membership }} </b-badge>
                </div>
            </b-col>
        </b-row>

        <hr />
        <b-alert v-model="isEarly" class="p-2" variant="primary">
            <i class="fas fa-info-circle me-1"></i>
            A penalty will be applied on early withdrawals!
        </b-alert>
        <b-button class="w-100" @click="isModalWithdrawShown = true" variant="primary"> Withdraw </b-button>
        <BaseModalWithdraw :show="isModalWithdrawShown" :is-early="isEarly" @hidden="isModalWithdrawShown = false" />
    </template>
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
            const { now, end } = this.veStore.lock;
            return Number(now) < Number(end);
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
