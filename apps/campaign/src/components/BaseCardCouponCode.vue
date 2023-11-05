<template>
    <b-card body-class="d-flex align-items-center">
        <div class="pe-3">
            <i class="fas fa-tags text-primary"></i>
        </div>
        <div class="flex-grow-1">
            <strong>
                {{ token.code }}
            </strong>
        </div>
        <div>
            <b-dropdown variant="link" size="sm" no-caret>
                <template #button-content>
                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                </template>
                <b-dropdown-item
                    target="_blank"
                    :href="token.webshopURL"
                    class="d-flex justify-content-between align-items-center"
                >
                    Use this code
                    <i class="fas fa-caret-right text-opaque"></i>
                </b-dropdown-item>
            </b-dropdown>
        </div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../stores/Wallet';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'BaseCardCustom',
    props: {
        token: {
            type: Object as PropType<TCouponRewardPayment>,
            required: true,
        },
    },
    data: function () {
        return {
            isVisible: false,
            isModalTransferShown: false,
            isSubmitting: false,
            error: '',
        };
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useWalletStore),
    },
    async mounted() {
        //
    },
    methods: {
        //
    },
});
</script>
<style>
a.text-accent {
    text-decoration: none;
}
</style>
