<template>
    <b-modal v-model="isShown" centered hide-footer @hidden="$emit('hidden')" @show="onShow">
        <template #header>
            <h5 class="modal-title"><i class="fas fa-gift me-2" /> Claim your rewards</h5>
            <b-link class="btn-close" @click="$emit('hidden')">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <b-alert v-model="isAlertInfoShown" variant="info" class="py-2 px-3">
            <i class="fas fa-exclamation-circle me-1" />
            {{ error }}
        </b-alert>
        <b-list-group class="mb-3">
            <b-list-group-item
                v-for="rewardToken of veStore.rewards"
                class="d-flex align-items-center justify-content-between"
            >
                <span class="text-opaque"> {{ rewardToken.tokenAddress.substring(0, 8) }}... </span>
                <b-badge variant="primary">
                    {{ rewardToken.amount }}
                </b-badge>
            </b-list-group-item>
        </b-list-group>
        <b-button class="w-100" variant="primary" @click="onClickWithdraw"> Claim Rewards </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useVeStore } from '../../stores/VE';
import { useWalletStore } from '../../stores/Wallet';

export default defineComponent({
    name: 'BaseModalClaimTokens',
    props: {
        show: Boolean,
    },
    data() {
        return {
            isShown: false,
            error: '',
        };
    },
    computed: {
        ...mapStores(useVeStore, useWalletStore),
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onClickWithdraw() {
            debugger;
        },
    },
});
</script>
