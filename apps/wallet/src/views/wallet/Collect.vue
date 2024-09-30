<template>
    <b-spinner v-if="isLoadingEntry" small />
    <template v-else>
        <b-alert v-model="isRemoved" variant="danger" class="p-2 px-3">
            <BaseIcon icon="exclamation-circle" class="me-2" />
            This QR code could not be loaded properly
        </b-alert>

        <b-alert v-model="isCollected" variant="danger" class="p-2 px-3">
            <BaseIcon icon="exclamation-circle" class="me-2" />
            This collectible has been collected already.
        </b-alert>

        <b-card
            v-if="entryStore.erc721 && entryStore.metadata"
            :title="entryStore.metadata.name"
            :img-src="entryStore.metadata.imageUrl"
            footer-class="py-3 "
            class="mb-3"
        >
            <BaseCardBodyCollectible :collection="entryStore.erc721" :metadata="entryStore.metadata" class="mb-3" />
        </b-card>

        <b-button
            v-if="!authStore.isAuthenticated"
            variant="primary"
            class="w-100"
            @click="authStore.isModalLoginShown = true"
        >
            Continue to login
        </b-button>
        <b-button
            v-else-if="!walletStore.wallet"
            variant="primary"
            class="w-100"
            @click="walletStore.isModalWalletCreateShown = true"
        >
            Connect Wallet
        </b-button>
        <b-button
            v-else
            variant="success"
            :disabled="isLoading || isCollected || isRemoved"
            class="w-100"
            @click="onClickCollect"
        >
            <b-spinner v-if="isLoading" small />
            <template v-else-if="isCollected">Already collected!</template>
            <template v-else-if="isRemoved">Not found</template>
            <template v-else>
                Collect with <strong>{{ shortenAddress(walletStore.wallet.address) }}</strong>
            </template>
        </b-button>

        <b-button
            variant="link"
            class="text-white text-opaque w-100 text-decoration-none"
            @click="isSupportShown = !isSupportShown"
        >
            <small>Show more details</small>
            <BaseIcon :icon="isSupportShown ? 'caret-up' : 'caret-down'" class="ms-1" />
        </b-button>
        <b-collapse v-model="isSupportShown">
            <b-card class="small">
                <div v-if="$route.params.uuid" class="pb-2">
                    <div class="d-flex align-items-center">
                        <span class="text-white text-opaque me-2">Code</span>
                        <b-button
                            v-clipboard:copy="$route.params.uuid"
                            v-clipboard:success="onCopyUUIDSuccess"
                            size="sm"
                            variant="dark"
                            class="text-white p-0 px-1 ms-auto"
                        >
                            Copy
                            <BaseIcon v-if="isCopiedUUID" icon="check" class="ms-1" />
                        </b-button>
                    </div>
                    <code class="small me-2 py-2 d-block">{{ $route.params.uuid }}</code>
                </div>

                <div v-if="accountStore.account">
                    <div class="d-flex align-items-center">
                        <span class="text-white text-opaque me-2">Account</span>
                        <b-button
                            v-clipboard:copy="accountStore.account.sub"
                            v-clipboard:success="onCopyAccountIDSuccess"
                            size="sm"
                            variant="dark"
                            class="text-white p-0 px-1 ms-auto"
                        >
                            Copy
                            <BaseIcon v-if="isCopiedAccountID" icon="check" class="ms-1" />
                        </b-button>
                    </div>
                    <code class="small me-2 py-2 d-block">{{ accountStore.account.sub }}</code>
                </div>
            </b-card>
        </b-collapse>
    </template>
</template>

<script lang="ts">
import { useAccountStore, useAuthStore, useEntryStore, useWalletStore } from '@thxnetwork/wallet/stores';
import { shortenAddress } from '@thxnetwork/wallet/utils/address';
import { toast } from '@thxnetwork/wallet/utils/toast';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ViewWalletOverview',
    data() {
        return {
            isLoading: false,
            isLoadingEntry: false,
            isCopiedAccountID: false,
            isCopiedUUID: false,
            isSupportShown: false,
            shortenAddress,
        };
    },
    computed: {
        ...mapStores(useAuthStore, useAccountStore, useEntryStore, useWalletStore),
        isCollected() {
            return this.entryStore.entry ? !!this.entryStore.entry.sub : false;
        },
        isRemoved() {
            return !this.entryStore.entry;
        },
    },
    async mounted() {
        try {
            const uuid = this.$route.params.uuid;
            if (!uuid) throw new Error('Entry not found');

            this.isLoadingEntry = true;

            await this.entryStore.get(uuid);

            this.accountStore.postMessage({ message: 'tws.iframe.toggle' });
        } catch (error: any) {
            console.dir(error);
            toast(error.message, 'light', 3000, () => {
                return;
            });
        } finally {
            this.isLoadingEntry = false;
        }
    },

    methods: {
        onCopyAccountIDSuccess() {
            this.isCopiedAccountID = true;
        },
        onCopyUUIDSuccess() {
            this.isCopiedUUID = true;
        },
        async onClickCollect() {
            try {
                const uuid = this.$route.params.uuid;
                this.isLoading = true;
                await this.entryStore.collect(uuid);

                toast('Congratulations! This collectible has been added to your collection', 'light', 3000, () => {
                    this.$router.push({ name: 'overview' });
                });
            } catch (error: any) {
                toast(error.message, 'light', 3000, () => {
                    return;
                });
            } finally {
                this.isLoading = false;
            }
        },
    },
});
</script>
<style>
.truncate-uuid,
.truncate-account-id {
    display: inline-block;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
