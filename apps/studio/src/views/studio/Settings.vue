<template>
    <template v-if="accountStore.account">
        <b-container class="py-5 text-white">
            <h1>Settings</h1>
            <p class="lead">Personalize your collectible wallet.</p>
        </b-container>
        <div class="bg-dark py-5 flex-grow-1">
            <b-container>
                <b-card v-for="profile of accountStore.profiles" variant="darker" class="mb-5">
                    {{ profile }}
                    <h3>Domain</h3>
                    <BaseFormGroup label="URL">
                        <b-form-input v-model="domain" />
                    </BaseFormGroup>
                    <h3>Theme</h3>
                    {{ theme }}
                </b-card>
            </b-container>
        </div>
    </template>
</template>

<script lang="ts">
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';
import { useAccountStore } from '@thxnetwork/studio/stores';

export default defineComponent({
    name: 'Account',
    data() {
        return { domain: '', theme: '' };
    },
    computed: {
        ...mapStores(useAccountStore),
    },
    async mounted() {
        await this.accountStore.get();
        await this.accountStore.getProfiles();
        console.log(this.accountStore.profiles);
    },
});
</script>
