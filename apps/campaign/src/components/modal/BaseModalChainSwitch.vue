<template>
    <b-modal
        :id="id"
        v-model="walletStore.isModalChainSwitchShown"
        @hidden="walletStore.isModalChainSwitchShown = false"
        centered
        hide-footer
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wifi me-2"></i> Change your connected network</h5>
            <b-link class="btn-close" @click="walletStore.isModalChainSwitchShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>
        <b-form>
            <b-alert v-model="isAlertShown" variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-1" />
                Your wallet is currently connected to <strong>{{ currentChain.name }}</strong> ({{
                    currentChain.chainId
                }})
            </b-alert>
            <p>
                Please change your network to
                <strong class="text-accent">{{ walletChain.name }}</strong> ({{ walletChain.chainId }}).
            </p>
        </b-form>
    </b-modal>
</template>

<script lang="ts">
import { chainList } from '../../utils/chains';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseModalChainSwitch',
    data() {
        return {
            chainList,
            isAlertShown: true,
        };
    },
    computed: {
        ...mapStores(useWalletStore),
        currentChain() {
            const { chainId } = this.walletStore;
            const chain = chainList[chainId];
            if (!chain) return { name: 'Unknown', chainId };
            return chain;
        },
        walletChain() {
            if (!this.walletStore.wallet) return { name: 'Unknown', chainId: '' };
            return chainList[this.walletStore.wallet.chainId];
        },
    },
});
</script>
