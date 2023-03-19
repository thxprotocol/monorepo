<template>
    <div class="flex-grow-1 overflow-auto">
        <component v-for="(perk, key) of perksStore.perks" :key="key" :is="perk.component" :perk="perk" class="mb-2" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';
import BaseCardPerkERC20 from '../components/BaseCardPerkERC20.vue';
import BaseCardPerkERC721 from '../components/BaseCardPerkERC721.vue';
import BaseCardPerkShopify from '../components/BaseCardPerkShopify.vue';

export default defineComponent({
    name: 'Perks',
    components: { BaseCardPerkERC20, BaseCardPerkERC721, BaseCardPerkShopify },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
    },
    created() {
        this.perksStore.list();
    },
});
</script>
