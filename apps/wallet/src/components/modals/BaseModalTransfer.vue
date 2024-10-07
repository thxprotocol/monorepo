<template>
    <b-modal :id="id" no-close-on-backdrop centered hide-footer no-close-on-esc title="Transfer" @show="onShow">
        <BaseFormGroup label="To">
            <b-form-input v-model="to" />
        </BaseFormGroup>
    </b-modal>
</template>

<script lang="ts">
import { useAccountStore, useWalletStore, useWeb3AuthStore } from '@thxnetwork/wallet/stores';
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseModalTransfer',
    props: {
        id: String,
        collectible: { type: Object as PropType<TERC721Token>, required: true },
    },
    data() {
        return {
            to: '',
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWeb3AuthStore, useWalletStore),
    },
    methods: {
        async onShow() {
            //
        },
        async onSubmit() {
            //
        },
    },
});
</script>
