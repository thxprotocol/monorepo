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
        <b-tabs v-else justified content-class="py-3">
            <b-tab title="Profile">
                <b-alert v-model="isErrorShown" variant="danger" class="p-2">
                    {{ error }}
                </b-alert>
                <b-alert v-model="isUsernameMissing" variant="danger" class="p-2">
                    <i class="fas fa-exclamation-circle mx-2" />
                    Please, set a username!
                </b-alert>
                <b-alert v-model="isProfileImgPlaceholder" variant="danger" class="p-2">
                    <i class="fas fa-exclamation-circle mx-2" />
                    Please, upload a profile picture!
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
            </b-tab>
            <b-tab title="Connected">
                <BaseFormGroupConnected class="mb-3" />
            </b-tab>
            <b-tab title="Subscriptions">
                <BaseFormGroupNotifications class="mb-3" />
            </b-tab>
        </b-tabs>

        <template #footer>
            <b-button
                class="w-100"
                variant="primary"
                :disabled="isDisabled"
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
        isErrorShown() {
            return !!this.error;
        },
        isUsernameMissing() {
            if (!this.accountStore.account) return;
            return !this.accountStore.account.username;
        },
        isProfileImgPlaceholder() {
            if (!this.accountStore.account) return;
            return this.accountStore.account.profileImg.startsWith('https://api.dicebear.com');
        },
        isMetamaskAccount() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.variant === AccountVariant.Metamask;
        },
        isEmailVerified() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.isEmailVerified;
        },
        isDisabled() {
            if (!this.accountStore.account) return true;
            return !this.isEmailVerified || !this.accountStore.account.username || this.isProfileImgPlaceholder;
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
