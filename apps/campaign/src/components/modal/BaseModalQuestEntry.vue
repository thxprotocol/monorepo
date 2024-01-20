<template>
    <b-modal
        v-model="isShown"
        :id="`quest_complete_${id}`"
        @show="onShow"
        @hidden="$emit('hidden')"
        centered
        no-close-on-backdrop
        no-close-on-esc
        content-class="gradient-shadow-xl"
    >
        <template #header>
            <h5 class="modal-title">
                {{ loading ? 'Loading...' : error ? 'Quest verification failed' : 'Quest completed!' }}
            </h5>
            <b-link class="btn-close" @click="isShown = false"><i class="fas fa-times"></i></b-link>
        </template>
        <div v-if="loading" class="text-center">
            <b-spinner show small variant="primary" />
        </div>
        <template v-else>
            <b-alert v-model="isAlertErrorShown" show variant="info" class="p-2 mb-0">
                <i class="fas fa-exclamation-circle me-1"></i>
                {{ error || subscribeError }}
            </b-alert>

            <template v-if="!error">
                <b-alert v-model="isAlertSuccessShown" show variant="success" class="p-2">
                    <i class="fas fa-trophy me-2"></i>
                    You have earned {{ amount }} points
                </b-alert>

                <div v-if="!isSubscribed">
                    <b-form-group
                        class="mb-0"
                        :state="isEmailValid"
                        description="Subscribe and receive e-mail notifications when new quests become available."
                    >
                        <b-form-input v-model="email" type="email" :state="isEmailValid" placeholder="E-mail" />
                    </b-form-group>
                </div>
                <p class="mb-0" v-else>Continue collecting points or redeem your points for rewards.</p>
            </template>
        </template>

        <template #footer>
            <b-button v-if="!isSubscribed" @click="onClickSubscribe" variant="primary" class="w-100 rounded-pill">
                Subscribe
            </b-button>
            <b-button :variant="isSubscribed ? 'primary' : 'link'" class="w-100 rounded-pill" @click="onClickContinue">
                <b-spinner v-if="isLoadingContinue" small variant="primary" />
                <template v-else>Continue</template>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';
import { useQuestStore } from '../../stores/Quest';

export default defineComponent({
    name: 'BaseModalQuestEntry',
    data() {
        return {
            isShown: false,
            isSubmitting: false,
            isLoadingContinue: false,
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
        ...mapStores(useQuestStore),
        isAlertErrorShown() {
            return !!this.error || !!this.subscribeError;
        },
        isAlertSuccessShown() {
            return !this.error && !this.subscribeError;
        },
        isEmailValid: function () {
            if (!this.email) return null;
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
                await this.accountStore.subscribe(this.email);
                this.onClickContinue();
            } catch (error) {
                this.subscribeError = 'This e-mail is used by someone else.';
                console.error(error);
            }
        },
        async onClickContinue() {
            this.isLoadingContinue = true;
            await this.questStore.list();
            this.isLoadingContinue = false;
            this.$emit('close');
        },
    },
});
</script>
