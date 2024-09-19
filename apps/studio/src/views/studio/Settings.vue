<template>
    <template v-if="accountStore.account">
        <b-container class="py-5 text-white">
            <h1>Settings</h1>
            <p class="lead">Personalize your collectible wallet.</p>
        </b-container>
        <div class="bg-dark py-5 flex-grow-1">
            <b-container>
                <b-row>
                    <b-col v-for="profile of accountStore.profiles" md="12">
                        <BaseCardProfile :profile="profile" />
                    </b-col>
                </b-row>
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
    },
    methods: {},
});
</script>
