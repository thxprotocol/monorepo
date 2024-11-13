<template>
    <b-modal
        v-model="walletStore.isModalChainSelectShown"
        centered
        hide-footer
        @hidden="walletStore.isModalChainSelectShown = false"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wallet me-2"></i> Select Chain</h5>
            <b-link class="btn-close" @click="walletStore.isModalChainSelectShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <div class="select-group">
            <b-button class="select-button" @click="onClickEVM"> EVM </b-button>
            <b-button class="select-button" @click="onClickAptos"> Aptos </b-button>
        </div>
    </b-modal>
</template>

<script lang="ts">
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalChainSelect',
    computed: {
        ...mapStores(useWalletStore),
    },
    methods: {
        onClickEVM() {
            this.walletStore.currentChainId = 137;
            this.walletStore.isModalWalletCreateShown = true;
            this.walletStore.isModalChainSelectShown = false;
        },
        onClickAptos() {
            this.walletStore.currentChainId = 1000000001;
            this.walletStore.isModalWalletCreateShown = true;
            this.walletStore.isModalChainSelectShown = false;
        },
    },
});
</script>

<style>
.select-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.select-button {
    color: #d4d4d4 !important;
    background-color: rgba(255, 255, 255, 0.02) !important;
    border: 0.5px solid #1d1d1d !important;
    font-size: 15px !important;
    padding: 5px !important;
    /* text-align: center; */
    /* font-feature-settings: 'liga' off, 'clig' off;
    font-family: Poppins;
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    line-height: 20px; */
}

.select-button:hover {
    background-color: #3b3a3ac2 !important;
}
</style>
