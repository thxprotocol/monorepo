<template>
    <b-row>
        <b-col>
            <b-form-group label="Voting power">
                <template #label>
                    <span class="text-opaque">Balance veTHX</span>
                    <i
                        v-b-tooltip
                        class="fas fa-question-circle text-opaque ms-1"
                        title="Your veTHX balance determines your governance voting power and your share in the BAL and 20USDC-80THX rewards."
                    />
                </template>
                {{ balance }}
            </b-form-group>
            <b-form-group>
                <template #label>
                    <span class="text-opaque">Locked 20USDC-80THX</span>
                    <i
                        v-b-tooltip
                        class="fas fa-question-circle text-opaque ms-1"
                        title="Your locked amount determines your veTHX balance together with your lock duration. Locking more 20USDC-80THX will increase your veTHX balance."
                    />
                </template>
                {{ amount }}
                <b-link
                    size="sm"
                    class="text-accent text-decoration-underline ms-2"
                    @click="isModalIncreaseAmountShown = true"
                >
                    Increase
                </b-link>
                <BaseModalIncreaseAmount
                    :chain-id="chainId"
                    :show="isModalIncreaseAmountShown"
                    @hidden="isModalIncreaseAmountShown = false"
                />
            </b-form-group>
            <b-form-group>
                <template #label>
                    <span class="text-opaque">Lock duration</span>
                    <i
                        v-b-tooltip
                        class="fas fa-question-circle text-opaque ms-1"
                        title="Your lock duration and locked amount determine your veTHX balance. Locking your 20USDC-80THX for longer will increase your veTHX balance. Only Thurdays up to 90 days from now are allowed."
                    />
                </template>
                {{ differenceInDays(veStore.lock.end, veStore.now) }} days
                <b-link
                    size="sm"
                    class="text-accent text-decoration-underline ms-2"
                    @click="isModalIncreaseLockEndShown = true"
                >
                    Increase
                </b-link>
                <BaseModalIncreaseLockEnd
                    :chain-id="chainId"
                    :show="isModalIncreaseLockEndShown"
                    @hidden="isModalIncreaseLockEndShown = false"
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
                        <i class="fas fa-id-card" style="font-size: 1.5rem" />
                    </div>
                </div>
                <b-badge class="mt-2 p-2" variant="primary">
                    <i class="fas fa-trophy me-1 text-opaque" />
                    {{ membership }}
                </b-badge>
            </div>
        </b-col>
    </b-row>
    <b-button class="w-100 mt-3" variant="primary" :disabled="isDisabled" @click="isModalWithdrawShown = true">
        Withdraw
    </b-button>
    <BaseModalWithdraw :show="isModalWithdrawShown" :is-early="isEarly" @hidden="isModalWithdrawShown = false" />
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useLiquidityStore } from '../../stores/Liquidity';
import { useVeStore } from '../../stores/VE';
import { format, differenceInDays } from 'date-fns';
import { contractNetworks } from '../../config/constants';
import { fromWei } from 'web3-utils';
import { ChainId } from '@thxnetwork/common/enums';

export default defineComponent({
    name: 'BaseTabWithdraw',
    props: {
        chainId: { type: Number as PropType<ChainId>, required: true },
    },
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
            if (!this.walletStore.chainId) return contractNetworks[ChainId.Polygon];
            return contractNetworks[this.walletStore.chainId];
        },
        isEarly() {
            return Number(this.veStore.now) < Number(this.veStore.lock.end);
        },
        balance() {
            return Number(fromWei(String(this.veStore.balance))).toFixed(6);
        },
        amount() {
            return Number(fromWei(String(this.veStore.lock.amount))).toFixed(6);
        },
        membership() {
            const price = this.liquidityStore.pricing['20USDC-80THX'];
            const amount = Number(fromWei(String(this.veStore.lock.amount)));
            const amountInUSD = amount * price;

            if (amountInUSD < 5) return 'No Rank';
            if (amountInUSD > 5 && amountInUSD < 50) return 'Rookie';
            if (amountInUSD > 50 && amountInUSD < 500) return 'Pro';
            if (amountInUSD > 500 && amountInUSD < 5000) return 'Elite';
            if (amountInUSD > 5000 && amountInUSD < 50000) return 'Master';
            if (amountInUSD > 50000 && amountInUSD < 500000) return 'Legend';
        },
        isDisabled() {
            return this.isLoadingAmount || this.isLoadingLockEnd;
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
