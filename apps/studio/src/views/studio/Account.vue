<template>
    <template v-if="accountStore.account">
        <b-container class="py-5 text-white">
            <h1>Account</h1>
            <p class="lead">Manage account and wallets used for executing transactions.</p>
        </b-container>
        <div class="bg-dark py-5 flex-grow-1">
            <b-container>
                <h3>Personal</h3>
                <b-card variant="darker" class="mb-5">
                    <BaseFormGroup label="E-mail">
                        {{ accountStore.account.email }}
                    </BaseFormGroup>
                    <BaseFormGroup label="Account ID">
                        {{ accountStore.account.sub }}
                    </BaseFormGroup>
                    <BaseFormGroup label="Created">
                        {{ accountStore.account.createdAt }}
                    </BaseFormGroup>
                </b-card>
                <h3>Wallets</h3>
                <b-card variant="darker" class="mb-5">
                    <BaseTableWallets />
                </b-card>
            </b-container>
        </div>
    </template>
</template>

<script lang="ts">
import { useAccountStore } from '@thxnetwork/studio/stores';
import { mapStores } from 'pinia';
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Account',
    computed: {
        ...mapStores(useAccountStore),
    },
    mounted() {
        this.accountStore.get();
    },
});
</script>
