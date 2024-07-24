<template>
    <b-form-group v-if="account.providerUserId" label="Provider User ID">
        <b-input-group>
            <b-form-input v-model="providerUserId" disabled />
            <b-input-group-append>
                <b-button
                    v-clipboard:copy="account.providerUserId"
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
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupProviderUserId',
    props: {
        account: { type: Object as PropType<TAccount>, required: true },
    },
    data() {
        return {
            isCopied: false,
            providerUserId: '',
        };
    },
    watch: {
        account: {
            immediate: true,
            handler() {
                this.providerUserId = this.account.providerUserId;
            },
        },
    },
    methods: {
        onCopySuccess() {
            this.isCopied = true;
        },
    },
});
</script>
