<template>
    <BaseCardPayment
        :icon="token.brand.logoImgURL"
        :reward-variant="RewardVariant.Coupon"
        :created-at="token.createdAt"
    >
        <template #header>
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

            <div v-else-if="code" class="d-flex align-items-center text-accent mb-0">
                <b-link class="me-2" @click="isVisible = !isVisible">
                    <i class="fas fa-eye" />
                </b-link>
                <strong class="truncate-text" style="letter-spacing: 0.25rem">{{ code }}</strong>
            </div>

            <span v-else>Code not found.</span>
        </template>

        <template #dropdown-items>
            <b-dropdown-item
                v-if="token.reward.webshopURL"
                target="_blank"
                :href="token.reward.webshopURL"
                link-class="d-flex justify-content-between align-items-center"
            >
                Use this code
                <i class="fas fa-caret-right text-opaque"></i>
            </b-dropdown-item>
        </template>
    </BaseCardPayment>
    <BaseModalExternalURL :show="isModalURLShown" :url="token.code" @hidden="isModalURLShown = false" />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useWalletStore } from '../../stores/Wallet';
import { useAccountStore } from '../../stores/Account';
import { format } from 'date-fns';
import BaseModalExternalURL from '../../components/modal/BaseModalExternalURL.vue';
import { RewardVariant } from '@thxnetwork/common/enums';

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
        return { format, RewardVariant, isVisible: false, isModalURLShown: false };
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
    width: 230px !important;
    white-space: nowrap;
    overflow: hidden;
    font-size: 0.8rem;
}

.truncate-text-ellipsis {
    display: inline-block;
    font-size: 0.8rem;
    width: 230px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
