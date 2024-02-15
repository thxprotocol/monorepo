<template>
    <div class="d-flex ps-3">
        <div class="d-flex align-items-center">
            Wallet
            <!-- <b-img
                :src="walletLogoMap[walletStore.wallet?.variant]"
                width="15"
                height="15"
                style="border-radius: 3px"
                class="me-2"
            />
            {{ walletStore.wallet?.short }} -->
        </div>
        <b-dropdown class="ms-auto me-3" size="sm" v-model="isOpen" variant="primary" no-caret>
            <template #button-content>
                <i class="fas fa-ellipsis-v ms-0" />
            </template>
            <b-dropdown-item
                v-for="wallet of walletStore.wallets"
                link-class="d-flex align-items-center"
                v-b-modal="`modalWallet${wallet._id}`"
            >
                <b-img
                    :src="walletLogoMap[wallet.variant]"
                    width="15"
                    height="15"
                    style="border-radius: 3px"
                    class="me-2"
                />
                {{ wallet.short }}
                <BaseModalWallet :id="`modalWallet${wallet._id}`" :wallet="wallet" size="lg" />
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item
                @click="walletStore.isModalWalletCreateShown = true"
                link-class="d-flex align-items-center"
            >
                New Wallet
            </b-dropdown-item>
            <BaseModalWalletCreate size="lg" />
        </b-dropdown>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { WalletVariant } from '../../types/enums/accountVariant';
import { GetAccountResult, PublicClient } from '@wagmi/core';
import { ChainId } from '@thxnetwork/sdk/src/lib/types/enums/ChainId';
import { Web3Modal } from '@web3modal/html';
import { chainList, getAddressURL } from '../../utils/chains';

export default defineComponent({
    name: 'BaseViewCampaignWallets',
    data(): {
        account: GetAccountResult<PublicClient> | null;
        modal: Web3Modal | null;
        error: string;
        isModalOpen: boolean;
        isSubmitting: boolean;
        chainList: { [chainId: number]: ChainInfo };
        getAddressURL: any;
        show: boolean;
        chainId: ChainId;
        unsubscribe: any;
        walletLogoMap: { [variant: string]: string };
        isOpen: boolean;
        variant: WalletVariant;
    } {
        return {
            error: '',
            account: null,
            modal: null,
            isModalOpen: false,
            isSubmitting: false,
            chainList,
            getAddressURL,
            show: false,
            chainId: ChainId.Polygon,
            unsubscribe: null,
            walletLogoMap,
            isOpen: false,
            variant: WalletVariant.Safe,
        };
    },
    computed: {
        ...mapStores(useWalletStore, useAccountStore),
    },
    watch: {
        'accountStore.account': {
            async handler(account: TAccount | null) {
                console.log(account);
                if (!account) return;
                await this.walletStore.listWallets();
                this.walletStore.list(this.walletStore.wallets[0]);
            },
            immediate: true,
        },
    },
});
</script>
