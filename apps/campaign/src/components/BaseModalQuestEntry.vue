<template>
    <b-modal
        v-model="isShown"
        :id="`quest_complete_${id}`"
        @show="onShow"
        @hidden="$emit('hidden')"
        centered
        no-close-on-backdrop
        no-close-on-esc
    >
        <template #header>
            <h5 class="modal-title">Quest Completed!</h5>
            <b-link class="btn-close" @click="isShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <div v-if="loading" class="text-center">
            <b-spinner show small variant="primary" />
        </div>
        <template v-else>
            <b-alert v-model="isAlertErrorShown" show variant="danger" class="p-2">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ error || subscribeError }}
            </b-alert>

            <template v-if="!error">
                <div class="h1 text-center text-accent mt-2">
                    <i class="fas fa-trophy mb-2"></i>
                    <p class="lead">You have earned {{ amount }} points</p>
                </div>

                <div v-if="!isSubscribed">
                    <p>Subscribe to receive notifications when new quests are available.</p>
                    <b-form-group v-if="!accountStore.account?.email" :state="isEmailValid">
                        <b-form-input v-model="email" type="email" :state="isEmailValid" placeholder="E-mail" />
                    </b-form-group>
                </div>
                <p v-else>Continue collecting points or redeem your points for rewards.</p>
            </template>
        </template>

        <template #footer>
            <b-button v-if="!isSubscribed" @click="onClickSubscribe" variant="primary" class="w-100 rounded-pill">
                Subscribe
            </b-button>
            <b-button :variant="isSubscribed ? 'primary' : 'link'" class="w-100 rounded-pill" @click="$emit('close')">
                Continue
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../stores/Account';

export default defineComponent({
    name: 'BaseCardPerkPayment',
    data() {
        return {
            isShown: false,
            isSubmitting: false,
            email: '',
            subscribeError: '',
        };
    },
    props: {
        id: String,
        amount: Number,
        error: String,
        loading: Boolean,
        show: Boolean,
    },
    watch: {
        show(value) {
            this.isShown = value;
        },
    },
    computed: {
        ...mapStores(useAccountStore),
        isAlertErrorShown() {
            return !!this.error || !!this.subscribeError;
        },
        isEmailValid: function () {
            return !!this.email;
        },
        isSubscribed() {
            const { subscription } = useAccountStore();
            return !!subscription;
        },
    },
    methods: {
        onShow() {
            if (this.accountStore.account) {
                const { email } = this.accountStore.account;
                this.email = email;
            }
        },
        async onClickSubscribe() {
            try {
                console.log(this.email);
                await this.accountStore.subscribe(this.email);
                this.$emit('close');
            } catch (error) {
                this.subscribeError = 'This e-mail is used by someone else.';
                console.error(error);
            }
        },
    },
});
</script>
