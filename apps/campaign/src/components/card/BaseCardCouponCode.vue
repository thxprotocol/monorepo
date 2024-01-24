<template>
    <b-card body-class="d-flex align-items-center py-2">
        <div class="pe-3">
            <i class="fas fa-tags text-primary"></i>
        </div>
        <div class="flex-grow-1"></div>
        <blockquote class="mb-0 d-flex align-items-center w-100 text-accent">
            <strong style="letter-spacing: 0.25rem">{{ code }}</strong>
            <b-button variant="primary" size="sm" class="ms-auto" @click="isVisible = !isVisible">
                <i class="fas fa-eye" />
            </b-button>
        </blockquote>
        <b-dropdown variant="link" size="sm" no-caret end>
            <template #button-content>
                <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
            </template>
            <b-dropdown-item
                target="_blank"
                :href="token.webshopURL"
                link-class="d-flex justify-content-between align-items-center"
            >
                Use this code
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
        </b-dropdown>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';

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
        isURL() {
            try {
                new URL(this.token.code);
                return true;
            } catch (error) {
                return false;
            }
        },
        code() {
            if (this.isVisible) return this.token.code;
            return this.token.code
                .split('')
                .map(() => '●')
                .join('');
        },
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
