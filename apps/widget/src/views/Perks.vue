<template>
    <BaseModalCampaignExpired :id="'modalCampaignExpiredPerks'" />
    <b-container class="flex-grow-1 overflow-auto order-md-4">
        <b-row>
            <b-col lg="11" offset-xl="1">
                <b-row>
                    <b-col md="4" :key="key" v-for="(perk, key) of perksStore.perks">
                        <component :is="perk.component" :perk="perk" class="m-2 mx-md-0 my-md-3" />
                    </b-col>
                </b-row>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapStores } from 'pinia';
import { usePerkStore } from '../stores/Perk';
import { useAccountStore } from '../stores/Account';
import BaseCardPerkERC20 from '../components/BaseCardPerkERC20.vue';
import BaseCardPerkERC721 from '../components/BaseCardPerkERC721.vue';
import BaseModalCampaignExpired from '../components/BaseModalCampaignExpired.vue';

export default defineComponent({
    name: 'Perks',
    components: { BaseCardPerkERC20, BaseCardPerkERC721, BaseModalCampaignExpired },
    computed: {
        ...mapStores(useAccountStore),
        ...mapStores(usePerkStore),
    },
    created() {
        this.perksStore.list();
    },
});
</script>
