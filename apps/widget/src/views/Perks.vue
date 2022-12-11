<template>
    <div class="py-2 text-center" v-if="accountStore.isAuthenticated">
        <div class="text-success h1 m-0">
            <strong>{{ accountStore.balance }}</strong>
        </div>
        <div class="text-white">points</div>
    </div>
    <div class="flex-grow-1 overflow-auto">
        <component v-for="(perk, key) of perksStore.perks" :key="key" :is="perk.component" :perk="perk" class="mb-2" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';
import { RewardVariant } from '../utils/rewards';
import { Brands } from '../utils/social';
import BaseCardPerkERC721 from '../components/BaseCardPerkERC721.vue';

export default defineComponent({
    name: 'Home',
    components: { BaseCardPerkERC721 },
    computed: {
        ...mapStores(usePerkStore),
        ...mapStores(useAccountStore),
    },
    data() {
        return {
            Brands,
            RewardVariant,
        };
    },
    mounted() {
        this.accountStore.init(this.$route.query).then(() => {
            this.perksStore.list();
        });
    },
});
</script>
