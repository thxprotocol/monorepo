<template>
    <b-form-group>
        <template #description>
            <slot name="description" />
        </template>
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
                Address on {{ chainList[wallet.chainId].name }}
            </div>
        </template>
        <b-input-group>
            <b-form-input v-model="address" disabled />
            <b-input-group-append>
                <b-button
                    v-clipboard:copy="wallet.address"
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
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { walletLogoMap } from '../../stores/Wallet';
import { chainList } from '../../utils/chains';

export default defineComponent({
    name: 'BaseFormGroupUsername',
    props: {
        wallet: Object,
        description: String,
    },
    data() {
        return { address: '', chainList, walletLogoMap, isCopied: false };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    watch: {
        wallet(wallet) {
            if (!wallet) return;
            this.address = wallet.address;
        },
    },
    methods: {
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>
