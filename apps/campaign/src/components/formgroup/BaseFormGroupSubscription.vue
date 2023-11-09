<template>
    <b-form-group label="Notifications" :invalid-feedback="error" :state="!!error">
        <b-form-checkbox variant="link" :checked="accountStore.subscription" @change="onChangeSubscription">
            <span class="text-opaque">New quests</span>
        </b-form-checkbox>
    </b-form-group>
</template>

<script lang="ts">
import { useAccountStore } from '../../stores/Account';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseFormGroupSubscription',
    data() {
        return {
            error: '',
            isLoading: false,
        };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    mounted() {
        this.accountStore.getSubscription();
    },
    methods: {
        async onChangeSubscription(isChecked: any) {
            if (!isChecked) return await this.accountStore.unsubscribe();
            try {
                await this.accountStore.subscribe();
                this.error = '';
            } catch (error) {
                this.error = 'This e-mail is used by someone else.';
            } finally {
                this.$emit('error', this.error);
            }
        },
    },
});
</script>
