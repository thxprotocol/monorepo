<template>
    <b-modal :id="id" centered hide-footer size="xl" title="Create Wallet">
        wagaw
        <b-button @click="onClickSubmit"> Create Wallet </b-button>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseModalWalletCreate',
    props: {
        id: String,
        wallet: Object as PropType<TWallet>,
    },
    methods: {
        onClickSubmit() {
            //
        },
    },
});
</script>
