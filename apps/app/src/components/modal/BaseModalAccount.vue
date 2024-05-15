<template>
    <b-modal
        v-model="accountStore.isModalAccountShown"
        centered
        @hidden="accountStore.isModalAccountShown = false"
        @show="onShow"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-user me-2" /> Account</h5>
            <b-link class="btn-close" @click="accountStore.isModalAccountShown = false">
                <i class="fas fa-times" />
            </b-link>
        </template>

        <div v-if="!accountStore.account" class="d-flex justify-content-center">
            <b-spinner small />
        </div>
        <b-form v-else>
            <b-alert v-if="error" show variant="danger" class="p-2">
                {{ error }}
            </b-alert>
            <b-row>
                <b-col cols="8">
                    <BaseFormGroupUsername class="mb-3" />
                    <BaseFormGroupEmail class="mb-3" />
                </b-col>
                <b-col cols="4" class="d-flex align-items-center justify-content-center">
                    <BaseFormGroupAvatar />
                </b-col>
            </b-row>
            <BaseFormGroupConnected class="mb-3" />
            <b-form-group label="Account ID">
                <b-input-group>
                    <b-form-input v-model="accountStore.account.sub" disabled />
                    <b-input-group-append>
                        <b-button
                            v-clipboard:copy="accountStore.account.sub"
                            v-clipboard:success="onCopySuccess"
                            size="sm"
                            variant="primary"
                        >
                            <i v-if="isCopied" class="fas fa-clipboard-check px-2" />
                            <i v-else class="fas fa-clipboard px-2" />
                        </b-button>
                    </b-input-group-append>
                </b-input-group>
            </b-form-group>
        </b-form>
        <template #footer>
            <b-button
                class="w-100"
                variant="primary"
                :disabled="!isEmailVerified"
                @click="accountStore.isModalAccountShown = false"
            >
                Close
            </b-button>
            <b-button variant="link" class="w-100 text-white" @click="onClickSignout">
                <b-spinner v-if="isLoadingReset" small variant="light" />
                <template v-else> Sign out </template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { useAuthStore } from '../../stores/Auth';
import { useAccountStore } from '../../stores/Account';
import { useWalletStore } from '../../stores/Wallet';
import { useQuestStore } from '../../stores/Quest';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { AccountVariant } from '../../types/enums/accountVariant';

export default defineComponent({
    name: 'BaseModalAccount',
    data() {
        return {
            AccountVariant,
            error: '',
            isCopied: false,
            isLoadingReset: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
        isMetamaskAccount() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.variant === AccountVariant.Metamask;
        },
        isEmailVerified() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.isEmailVerified;
        },
    },
    methods: {
        onShow() {
            // this.accountStore.getAccount();
        },
        onClickSignout() {
            this.accountStore.signout();
            this.accountStore.isModalAccountShown = false;
        },
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>
