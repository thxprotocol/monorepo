<template>
    <BaseCardReward :reward="reward" :image="reward.image" @submit="onClickRedeem">
        <template #title>
            <div class="flex-grow-1">{{ reward.title }}</div>
        </template>
    </BaseCardReward>
    <BaseModalRewardPayment
        :id="`${id}${reward.uuid}`"
        :show="isModalShown"
        :error="error"
        :reward="reward"
        :is-loading="isSubmitting"
        @hidden="onModalHidden"
        @submit-redemption="onSubmitRedemption"
    />
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent, PropType } from 'vue';
import { useAccountStore } from '../../stores/Account';
import { useRewardStore } from '../../stores/Reward';
import { useWalletStore } from '../../stores/Wallet';
import { useAuthStore } from '../../stores/Auth';
import { format } from 'date-fns';

export default defineComponent({
    name: 'BaseCardRewardCustom',
    data() {
        return { format, id: 'modalCustomrewardPayment', error: '', isModalShown: false, isSubmitting: false };
    },
    props: {
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
    },
    computed: {
        ...mapStores(useRewardStore),
        ...mapStores(useAccountStore),
        ...mapStores(useAuthStore),
    },
    methods: {
        onModalHidden() {
            this.isModalShown = false;
            this.error = '';
        },
        onClickRedeem() {
            if (!this.accountStore.isAuthenticated) this.accountStore.signin();
            else this.isModalShown = true;
        },
        onSubmitRedemption() {
            this.isSubmitting = true;
            this.rewardStore
                .createCustomRedemption(this.reward._id)
                .then(async () => {
                    const walletStore = useWalletStore();
                    await this.accountStore.getParticipants();
                    walletStore.list();
                    this.isModalShown = false;
                })
                .catch(({ error }) => {
                    this.error = error && error.message;
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },
    },
});
</script>
