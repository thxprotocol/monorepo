<template>
    <b-card body-class="d-flex align-items-center" class="m-2">
        {{ error }}
        <div class="pe-3">
            <img height="25" :src="token.erc20.logoImgUrl" />
        </div>
        <div class="flex-grow-1">
            <strong>{{ token.erc20.name }}</strong>
        </div>
        <div class="text-success fw-bold">{{ token.walletBalance }} {{ token.erc20.symbol }}</div>
        <div>
            <b-dropdown variant="link" size="sm" no-caret>
                <template #button-content>
                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                </template>
                <b-dropdown-item
                    :disabled="
                        walletStore.wallet?.version && walletStore.wallet?.version !== walletStore.wallet?.latestVersion
                    "
                    @click="isModalTransferShown = true"
                >
                    Transfer
                </b-dropdown-item>
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
import BaseModalERC20Transfer from '../components/BaseModalERC20Transfer.vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../stores/Wallet';

export default defineComponent({
    name: 'BaseCardERC20',
    components: {
        BaseModalERC20Transfer,
    },
    props: {
        token: {
            type: Object as PropType<TERC20Token>,
            required: true,
        },
    },
    data: function () {
        return { isModalTransferShown: false, error: '', isPendingApproval: false, isPendingTransfer: false };
    },
    computed: {
        ...mapStores(useWalletStore),
    },
    methods: {
        onModalTransferHidden() {
            this.isModalTransferShown = false;
        },
        async onSubmitTransfer(config: TERC20TransferConfig) {
            try {
                // Request approve TX
                this.isPendingApproval = true;
                await this.walletStore.approveERC20(config);
                this.isPendingApproval = false;
            } catch (error) {
                this.error = (error as Error).message;
            }

            try {
                // is waiting for approval
                this.isPendingTransfer = true;
                await this.walletStore.transferERC20(config);
                this.isPendingTransfer = false;
                await this.walletStore.list();
                this.isModalTransferShown = false;
            } catch (error) {
                this.error = (error as Error).message;
            }
        },
    },
});
</script>
