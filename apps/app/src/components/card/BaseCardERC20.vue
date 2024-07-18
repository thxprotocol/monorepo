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
                <span class="small text-opaque">{{ token.erc20.symbol }}</span>
            </div>
        </template>

        <template #dropdown-items>
            <b-dropdown-item disabled @click="isModalTransferShown = true"> Transfer </b-dropdown-item>
            <b-dropdown-item :href="blockExplorerURL"> Block Explorer </b-dropdown-item>
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
import { RewardVariant } from '@thxnetwork/common/enums';
import { chainList } from '@thxnetwork/app/utils/chains';

export default defineComponent({
    name: 'BaseCardERC20',
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
            const { wallet, chainId } = this.walletStore;
            if (!wallet || !chainId) return;

            return chainList[chainId].blockExplorer + '/token/' + this.token.erc20.address + '?a=' + wallet.address;
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
