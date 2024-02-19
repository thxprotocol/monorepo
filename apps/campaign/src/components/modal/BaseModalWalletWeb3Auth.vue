<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @show="onShow"
        @hidden="isShown = false"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-wallet me-2"></i> Wallet</h5>
            <b-link class="btn-close" @click="isShown = false">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <b-form>
            <b-alert v-if="error" show variant="danger" class="p-2">{{ error }}</b-alert>

            <b-form-group>
                <template #label>
                    <div class="d-flex align-items-center">
                        <img
                            :src="walletLogoMap[wallet.variant]"
                            width="15"
                            height="15"
                            style="border-radius: 3px"
                            class="me-2"
                            alt="Safe Logo"
                        />
                        Wallet Address
                    </div>
                </template>
                <code>{{ wallet.address }}</code>
            </b-form-group>

            <b-form-group :label="`Account Private Key`">
                <b-input-group>
                    <b-form-input :value="privateKey" />
                    <b-input-group-append>
                        <b-button size="sm" variant="primary" @click="isPrivateKeyHidden = !isPrivateKeyHidden">
                            <i v-if="isPrivateKeyHidden" class="fas fa-eye px-2"></i>
                            <i v-else class="fas fa-eye-slash px-2"></i>
                        </b-button>
                        <b-button
                            size="sm"
                            variant="primary"
                            v-clipboard:copy="authStore.privateKey"
                            v-clipboard:success="onCopySuccess"
                        >
                            <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                            <i v-else class="fas fa-clipboard px-2"></i>
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-form-group>
        </b-form>
        <template #footer>
            <b-button class="w-100" variant="primary" @click="isShown = false"> Close </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore, walletLogoMap } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { WalletVariant } from '../../types/enums/accountVariant';
import { fromWei } from 'web3-utils';

export default defineComponent({
    name: 'BaseModalWallet',
    data() {
        return {
            isShown: false,
            walletLogoMap,
            WalletVariant,
            error: '',
            isCopied: false,
            isPrivateKeyHidden: true,
            fromWei,
        };
    },
    props: {
        id: String,
        wallet: { type: Object, required: true },
    },
    watch: {
        show(show: boolean) {
            this.isShown = show;
        },
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
        ...mapStores(useQuestStore),
        ...mapStores(useWalletStore),
        privateKey() {
            if (!this.authStore.privateKey) return '';
            if (this.isPrivateKeyHidden) return this.authStore.privateKey.replace(/./g, '•');
            return this.authStore.privateKey;
        },
    },
    methods: {
        onCopySuccess() {
            this.isCopied = true;
        },
        async onShow() {
            await this.authStore.triggerLogin();
            await this.authStore.getPrivateKey();
        },
    },
});
</script>
