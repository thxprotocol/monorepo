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
            <b-form-input disabled v-model="wallet.address" />
            <b-input-group-append>
                <b-button
                    size="sm"
                    variant="primary"
                    v-clipboard:copy="wallet.address"
                    v-clipboard:success="onCopySuccess"
                >
                    <i v-if="isCopied" class="fas fa-clipboard-check px-2"></i>
                    <i v-else class="fas fa-clipboard px-2"></i>
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
    data() {
        return { chainList, walletLogoMap, isCopied: false };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    props: {
        wallet: {
            type: Object,
            required: true,
        },
        description: String,
    },
    methods: {
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>
