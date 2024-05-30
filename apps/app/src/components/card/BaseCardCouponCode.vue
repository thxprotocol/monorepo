<template>
    <b-card body-class="d-flex align-items-center py-2">
        <div class="pe-3">
            <i class="fas fa-tags text-primary"></i>
        </div>
        <div class="flex-grow-1 d-flex align-items-center justify-content-between">
            <b-link
                v-if="isURL"
                size="sm"
                style="text-align: left"
                class="d-flex align-items-center text-accent text-decoration-underline"
                @click="isModalURLShown = true"
            >
                <div class="truncate-text-ellipsis">{{ token.code }}</div>
                <i class="fas fa-external-link-alt ms-3" />
            </b-link>
            <div v-else-if="code" class="mb-0 d-flex align-items-center w-100 text-accent">
                <strong class="truncate-text" style="letter-spacing: 0.25rem">{{ code }}</strong>
                <b-button variant="link" size="sm" class="ms-auto" @click="isVisible = !isVisible">
                    <i class="fas fa-eye" />
                </b-button>
            </div>
            <span v-else>Code not found.</span>
        </div>
        <b-dropdown v-if="token.webshopURL" variant="link" size="sm" no-caret end>
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
    <BaseModalExternalURL :show="isModalURLShown" :url="token.code" @hidden="isModalURLShown = false" />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import BaseModalExternalURL from '../../components/modal/BaseModalExternalURL.vue';

export default defineComponent({
    name: 'BaseCardCouponCode',
    components: {
        BaseModalExternalURL,
    },
    props: {
        token: {
            type: Object as PropType<TRewardCouponPayment>,
            required: true,
        },
    },
    data() {
        return {
            isVisible: false,
            isModalURLShown: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore, useWalletStore),
        isURL() {
            if (!this.token.code) return '';
            try {
                new URL(this.token.code);
                return true;
            } catch (error) {
                return false;
            }
        },
        code() {
            if (!this.token.code) return '';
            if (this.isVisible) return this.token.code;
            return this.token.code
                .split('')
                .map(() => '•')
                .join('');
        },
    },
});
</script>
<style>
.truncate-text {
    display: inline-block;
    width: 245px;
    white-space: nowrap;
    overflow: hidden;
}

.truncate-text-ellipsis {
    display: inline-block;
    width: 245px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
