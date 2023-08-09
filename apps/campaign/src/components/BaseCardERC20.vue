<template>
    <b-card body-class="d-flex align-items-center">
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
                <b-dropdown-item @click="onClickMigrate" v-if="isMigrateAvailable"> Migrate </b-dropdown-item>
                <b-dropdown-item
                    v-else
                    @click="isModalTransferShown = true"
                    :disabled="
                        walletStore.wallet?.version && walletStore.wallet?.version !== walletStore.wallet?.latestVersion
                    "
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
import BaseModalERC20Transfer from '../components/BaseModalERC20Transfer.vue';
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useWalletStore } from '../stores/Wallet';
import { useAccountStore } from '../stores/Account';
import { toast } from '../utils/toast';
import { fromWei } from 'web3-utils';

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
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
        isMigrateAvailable() {
            return Number(fromWei(this.token.migrationBalance)) > 0;
        },
    },
    mounted() {},
    methods: {
        onToastClose() {
            this.walletStore.list();
        },
        onModalTransferHidden() {
            this.isModalTransferShown = false;
        },
        onSubmitTransfer(config: TERC20TransferConfig) {
            toast(
                'Processing transaction...',
                15000,
                async () => {
                    try {
                        this.isModalTransferShown = false;
                        this.isPendingTransfer = true;
                        await this.walletStore.transferERC20(config);
                        this.isPendingTransfer = false;
                    } catch (error) {
                        this.error = (error as Error).message;
                    }
                },
                async () => {
                    await this.walletStore.list();
                },
            );
        },
        async onClickMigrate() {
            this.isMigratingTokens = true;
            toast(
                'Transfer to Safe Wallet...',
                15000,
                async () => await this.accountStore.migrate({ erc20Id: this.token.erc20._id }),
                async () => await this.walletStore.list(),
            );

            this.isMigratingTokens = false;
        },
    },
});
</script>
