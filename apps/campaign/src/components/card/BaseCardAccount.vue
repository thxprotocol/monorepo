<template>
    <b-card class="bg-splash" style="border-radius: 0">
        <div
            @click="accountStore.isModalAccountShown = true"
            class="d-flex justify-content-center align-items-center p-3 cursor-pointer"
            style="border-radius: 5px; background-color: rgba(0, 0, 0, 0.35); width: 100%; height: 90px"
        >
            <template v-if="accountStore.account">
                <b-avatar size="50" :src="accountStore.account.profileImg" class="gradient-border-xl" />
                <div class="px-3" style="min-width: 200px">
                    <h3 class="text-white mb-0">{{ accountStore.account.username }}</h3>
                </div>
            </template>
            <b-spinner v-else small class="text-opaque" />
        </div>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { useAccountStore } from '../../stores/Account';

export default defineComponent({
    name: 'BaseCardAccount',
    data() {
        return {};
    },
    computed: {
        ...mapStores(useAccountStore),
    },
});
</script>
