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
            <b-button class="select-button" @click="onClickEVM">
                <img :src="ImgLogoSepolia" alt="Add Icon" style="width: 32px; height: 32px; border-radius: 8px" />
                EVM
            </b-button>
            <b-button class="select-button" @click="onClickAptos">
                <img :src="ImgLogoAptos" alt="Add Icon" style="width: 32px; height: 32px; border-radius: 8px" />
                Aptos
            </b-button>
        </div>
    </b-modal>
</template>

<script lang="ts">
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import ImgLogoSepolia from '../../assets/thx_logo_sepolia.svg';
import ImgLogoAptos from '../../assets/thx_logo_aptos.svg';

export default defineComponent({
    name: 'BaseModalChainSelect',
    data() {
        return {
            ImgLogoSepolia,
            ImgLogoAptos,
        };
    },
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
    color: var(--body-text) !important;
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
    background-color: var(--dropdown-border-color) !important;
}
</style>
