<template>
    <b-form-group label="Account ID">
        <b-input-group>
            <b-form-input v-model="sub" disabled />
            <b-input-group-append>
                <b-button
                    v-clipboard:copy="account.sub"
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
    name: 'BaseFormGroupAccountId',
    props: {
        account: { type: Object as PropType<TAccount>, required: true },
    },
    data() {
        return {
            isCopied: false,
            sub: '',
        };
    },
    watch: {
        account: {
            immediate: true,
            handler() {
                this.sub = this.account.sub;
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
