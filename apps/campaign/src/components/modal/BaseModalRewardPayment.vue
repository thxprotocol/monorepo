<template>
    <b-modal
        :id="id"
        v-model="isShown"
        @hidden="$emit('hidden')"
        :title="reward && reward.title"
        centered
        content-class="gradient-shadow-xl"
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title"><i class="fas fa-gift me-2"></i> {{ reward.title }}</h5>
            <b-link class="btn-close" @click="isShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <div v-if="isLoading" class="text-center">
            <b-spinner show size="sm" />
        </div>
        <template v-else>
            <b-alert v-model="isAlertDangerShown" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error }}
            </b-alert>
            <p class="m-0">
                Do you want to redeem {{ reward.pointPrice }} points for <strong>{{ reward.title }} </strong>?
            </p>
            <div id="payment-element"></div>
        </template>
        <template #footer>
            <template v-if="reward.price > 0">
                <b-button
                    variant="success"
                    class="w-100 rounded-pill"
                    :disabled="isLoading"
                    :to="`/c/${accountStore.config.slug}/checkout/${reward.uuid}`"
                >
                    <b-spinner small variant="primary" v-if="isSubmitting" />
                    {{ reward.price }} {{ reward.priceCurrency }}
                </b-button>
                <b-button
                    variant="primary"
                    class="w-100 rounded-pill"
                    :disabled="isLoading"
                    @click="$emit('submit-redemption')"
                >
                    {{ reward.pointPrice }} points
                </b-button>
            </template>
            <b-button
                v-else
                variant="success"
                class="w-100 rounded-pill"
                :disabled="isLoading || reward.isLocked"
                @click="$emit('submit-redemption')"
            >
                <b-spinner small variant="primary" v-if="isSubmitting" />
                <template v-else-if="reward.isLocked"> <i class="fas fa-lock"></i></template>

                <template v-else> {{ reward.pointPrice }} points</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { mapStores } from 'pinia';
import { useRewardStore } from '../../stores/Reward';
import { useAccountStore } from '../../stores/Account';

export default defineComponent({
    name: 'BaseModalRewardPayment',
    data() {
        return {
            isShown: false,
            isSubmitting: false,
        };
    },
    props: {
        id: {
            type: String,
            required: true,
        },
        error: {
            type: String,
        },
        show: {
            type: Boolean,
        },
        isLoading: {
            type: Boolean,
        },
        reward: {
            type: Object as PropType<TReward>,
            required: true,
        },
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(useRewardStore),
        isAlertDangerShown() {
            return !!this.error;
        },
    },
});
</script>
