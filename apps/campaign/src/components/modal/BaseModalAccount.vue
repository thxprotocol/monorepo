<template>
    <b-modal
        v-model="accountStore.isModalAccountShown"
        @hidden="accountStore.isModalAccountShown = false"
        @show="onShow"
        centered
        :no-close-on-backdrop="isMetamaskAccount"
        :no-close-on-esc="isMetamaskAccount"
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-user me-2"></i> Account</h5>
            <b-link class="btn-close" @click="accountStore.isModalAccountShown = false" v-if="!isMetamaskAccount">
                <i class="fas fa-times"></i>
            </b-link>
        </template>

        <div v-if="!accountStore.account" class="d-flex justify-content-center">
            <b-spinner small />
        </div>
        <b-form v-else>
            <b-alert v-if="error" show variant="danger" class="p-2">{{ error }}</b-alert>
            <b-tabs justified content-class="mt-3">
                <b-tab title="Settings">
                    <b-row>
                        <b-col cols="8">
                            <BaseFormGroupUsername class="mb-3" />
                            <BaseFormGroupEmail class="mb-3" />
                        </b-col>
                        <b-col cols="4" class="d-flex align-items-center justify-content-center">
                            <BaseFormGroupAvatar />
                        </b-col>
                    </b-row>
                    <hr />
                    <BaseFormGroupAccountVariant v-if="isMetamaskAccount" class="mb-3" />
                    <b-form-group label="Account ID">
                        <code>{{ accountStore.account.sub }}</code>
                    </b-form-group>
                </b-tab>
                <b-tab title="Connected">
                    <BaseFormGroupConnected class="mb-3" />
                </b-tab>
                <!-- <b-tab title="Subscriptions">
                    <BaseFormGroupSubscription v-if="accountStore.poolId && questStore.quests.length" class="mb-3" />
                </b-tab> -->
            </b-tabs>
        </b-form>
        <template #footer>
            <b-button
                class="w-100"
                variant="primary"
                :disabled="isMetamaskAccount"
                @click="accountStore.isModalAccountShown = false"
            >
                Close
            </b-button>
            <b-button variant="link" class="w-100 text-white" @click="onClickSignout">
                <b-spinner small variant="light" v-if="isLoadingReset" />
                <template v-else>Sign out</template>
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
            isLoadingReset: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useAuthStore, useQuestStore, useWalletStore),
        isMetamaskAccount() {
            if (!this.accountStore.account) return false;
            return this.accountStore.account.variant === AccountVariant.Metamask;
        },
    },
    methods: {
        async onShow() {
            await this.accountStore.getAccount();
            this.accountStore.getSubscription();
        },
        onClickSignout() {
            this.accountStore.signout();
            this.accountStore.isModalAccountShown = false;
        },
    },
});
</script>
