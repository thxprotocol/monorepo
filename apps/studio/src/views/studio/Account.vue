<template>
    <template v-if="accountStore.account">
        <b-container class="py-5 text-white">
            <h1>{{ accountStore.account.username }}</h1>
            <p class="lead">{{ accountStore.account.email }}</p>
        </b-container>
        <div class="bg-dark py-5 flex-grow-1">
            <b-container>
                <b-card variant="darker">
                    <BaseFormGroup label="Account ID">
                        {{ accountStore.account.sub }}
                    </BaseFormGroup>
                    <BaseFormGroup label="Created">
                        {{ accountStore.account.createdAt }}
                    </BaseFormGroup>
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
    computed: {
        ...mapStores(useAccountStore),
    },
    async mounted() {
        await this.accountStore.get();
    },
});
</script>
