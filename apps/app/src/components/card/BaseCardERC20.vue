<template>
    <b-card body-class="d-flex align-items-center" class="mb-1">
        <div v-if="token.erc20" class="pe-3">
            <img height="20" :src="token.erc20.logoImgUrl" />
        </div>
        <div class="flex-grow-1">
            {{ token.erc20.symbol }}
        </div>
        <div class="text-success">{{ token.walletBalance }}</div>
        <div>
            <b-dropdown variant="link" size="sm" no-caret end toggle-class="py-0">
                <template #button-content>
                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                </template>
                <b-dropdown-item @click="isModalTransferShown = true"> Transfer </b-dropdown-item>
            </b-dropdown>
            <BaseModalERC20Transfer
                :id="`modalERC20Transfer${token.erc20._id}`"
                :show="isModalTransferShown"
                :error="error"
                :token="token"
                :is-loading="isPendingApproval || isPendingTransfer"
                @hidden="onModalTransferHidden"
                @submit="onSubmitTransfer"
            />
        </div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { toast } from '../../utils/toast';
import { fromWei } from 'web3-utils';

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
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
        isMigrateAvailable() {
            return this.token.migrationBalance ? Number(fromWei(this.token.migrationBalance)) > 0 : false;
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
