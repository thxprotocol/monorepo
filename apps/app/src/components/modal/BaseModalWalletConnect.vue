<template>
    <b-modal
        :id="id"
        v-model="walletStore.isModalChainSwitchShown"
        centered
        hide-footer
        @hidden="walletStore.isModalChainSwitchShown = false"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wifi me-2" /> Check your wallet settings</h5>
            <b-link class="btn-close" @click="walletStore.isModalChainSwitchShown = false">
                <i class="fas fa-times" />
            </b-link>
        </template>
        <div v-if="walletStore.wallet">
            <b-card v-if="isAlertAccountShown">
                <b-alert v-model="isAlertAccountShown" variant="primary" class="p-2">
                    <i class="fas fa-exclamation-circle me-2" />
                    <template v-if="currentAddress">
                        Connected to <strong>{{ shortenAddress(currentAddress) }}</strong>
                    </template>
                    <template v-else>Wallet not connected</template>
                </b-alert>
                <b-button class="w-100" variant="success" @click="onClickConnect">
                    Connect <strong>{{ shortenAddress(walletAddress) }}</strong>
                </b-button>
            </b-card>
        </div>
    </b-modal>
</template>

<script lang="ts">
import { chainList } from '../../utils/chains';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAccountStore } from '@thxnetwork/app/stores/Account';
import { ChainId } from '@thxnetwork/common/enums';
import { shortenAddress } from '@thxnetwork/app/utils/address';

export default defineComponent({
    name: 'BaseModalWalletConnect',
    props: {
        id: String,
    },
    data() {
        return {
            chainList,
            shortenAddress,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
        isAlertAccountShown() {
            return this.walletAddress !== this.currentAddress;
        },
        currentAddress() {
            const { account } = this.walletStore;
            if (!account) return '';
            return account.address;
        },
        walletAddress() {
            if (!this.walletStore.wallet) return '';
            return this.walletStore.wallet.address;
        },
    },
    async mounted() {
        await this.walletStore.createWeb3Modal();
    },
    methods: {
        onClickSwitchChain(chainId: ChainId) {
            this.walletStore.switchChain(chainId);
        },
        async onClickConnect() {
            await this.walletStore.disconnect();
            this.walletStore.connect();
        },
    },
});
</script>
