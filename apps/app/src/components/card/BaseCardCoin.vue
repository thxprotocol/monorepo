<template>
    <BaseCardPayment
        :reward-variant="RewardVariant.Coin"
        :icon="token.erc20 && token.erc20.logoImgUrl"
        :created-at="token.createdAt"
    >
        <template #header>
            <div>
                <div class="text-success fw-bold me-auto">
                    {{ token.walletBalance }}
                </div>
                <div class="small text-opaque">{{ token.erc20.symbol }}</div>
            </div>
        </template>

        <template #dropdown-items>
            <b-dropdown-item
                :disabled="isDisabledTransfer"
                link-class="d-flex justify-content-between align-items-center"
                @click="isModalTransferShown = true"
            >
                Transfer
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
            <b-dropdown-item
                :href="blockExplorerURL"
                target="_blank"
                link-class="d-flex justify-content-between align-items-center"
            >
                Block Explorer <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
            <BaseModalERC20Transfer
                :id="`modalERC20Transfer${token.erc20._id}`"
                :show="isModalTransferShown"
                :error="error"
                :token="token"
                :is-loading="isPendingApproval || isPendingTransfer"
                @hidden="onModalTransferHidden"
                @submit="onSubmitTransfer"
            />
        </template>
    </BaseCardPayment>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { toast } from '../../utils/toast';
import { fromWei } from 'web3-utils';
import { RewardVariant, WalletVariant } from '@thxnetwork/common/enums';
import { chainList } from '@thxnetwork/app/utils/chains';

export default defineComponent({
    name: 'BaseCardCoin',
    props: {
        token: {
            type: Object as PropType<TERC20Token>,
            required: true,
        },
    },
    data: function () {
        return {
            showToast: true,
            isModalTransferShown: false,
            isMigratingTokens: false,
            error: '',
            isPendingApproval: false,
            isPendingTransfer: false,
            RewardVariant,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
        isMigrateAvailable() {
            return this.token.migrationBalance ? Number(fromWei(this.token.migrationBalance)) > 0 : false;
        },
        blockExplorerURL() {
            if (!this.walletStore.wallet) return;
            return (
                chainList[this.token.chainId].blockExplorer +
                '/token/' +
                this.token.erc20.address +
                '?a=' +
                this.walletStore.wallet.address
            );
        },
        isDisabledTransfer() {
            return this.walletStore.wallet?.variant !== WalletVariant.Safe;
        },
    },
    methods: {
        onToastClose() {
            this.walletStore.list();
        },
        onModalTransferHidden() {
            this.isModalTransferShown = false;
        },
        async onSubmitTransfer(config: TERC20TransferConfig) {
            try {
                this.isPendingTransfer = true;
                await this.walletStore.transferERC20(config);
                this.isModalTransferShown = false;
                toast('Executing transaction...', 'dark', 45000, this.walletStore.list);
            } catch (error) {
                this.error = 'Transaction failed.';
                console.error(error);
            } finally {
                this.isPendingTransfer = false;
            }
        },
    },
});
</script>
