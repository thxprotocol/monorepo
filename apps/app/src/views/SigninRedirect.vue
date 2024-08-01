<template>
    <div class="h-100 d-flex align-items-center justify-content-center">
        <b-container class="py-5">
            <b-row>
                <b-col md="6" offset-md="3">
                    <b-alert v-model="isAlertDangerShown" variant="danger" class="p-2">
                        <i class="fas fa-exclamation-circle mx-2" />
                        {{ error }}
                    </b-alert>
                    <b-alert v-model="isAlertSuccessShown" variant="success" class="p-2">
                        <i class="fas fa-check-circle mx-2" />
                        We have connected your account, you can continue!
                    </b-alert>
                    <div class="text-center">
                        <b-button class="px-5" variant="primary" @click="onClickClose"> Close this window </b-button>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { supabase } from '../stores/Account';

export default defineComponent({
    name: 'ViewSigninRedirect',
    data() {
        return {
            error: '',
        };
    },
    computed: {
        isAlertSuccessShown() {
            return !this.error;
        },
        isAlertDangerShown() {
            return this.error !== '';
        },
    },
    // User is only redirected here using auth on an _blank page or popup
    async mounted() {
        // Check query params for error
        if (this.$route.query.error) {
            this.error = this.$route.query.error_description;
        }

        // Start listening for signed_in event
        else {
            const { data, error } = await supabase.auth.getSession();
            console.log({ data });
            if (error) throw new Error(error.message);
            navigator.serviceWorker.controller?.postMessage({
                action: 'setSession',
                session: data.session,
            });
        }
    },
    methods: {
        onClickClose() {
            window.close();
        },
    },
});
</script>
