<template>
    <b-modal :id="id" v-model="isShown" @hidden="$emit('hidden')" no-close-on-backdrop centered no-close-on-esc>
        <template #title><i class="fas fa-tools me-2"></i> Upgrade wallet</template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert variant="success" show class="py-1 px-2" v-if="walletStore.wallet?.isUpgradeAvailable">
                <i class="fas fa-gift me-1"></i>
                Smart Contract Wallet upgrade available!
            </b-alert>
            <b-alert v-if="error" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>
            <p>We release new features for your wallet regularly, if you are ready to enjoy them please continue.</p>
        </template>
        <template #footer>
            <b-button variant="primary" class="w-100 rounded-pill" :disabled="isSubmitDisabled" @click="onClickSubmit">
                Upgrade
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'BaseModalWalletUpgrade',
    data() {
        return { isShown: false, amount: 0, receiver: '' };
    },
    computed: {
        ...mapStores(useWalletStore),
        isSubmitDisabled: function () {
            return this.isLoading;
        },
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    methods: {
        onClickSubmit() {
            this.$emit('submit');
        },
    },
});
</script>
