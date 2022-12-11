<template>
    <b-card class="m-2 disabled" :img-src="imgUrl">
        <b-card-title class="d-flex">
            <div class="flex-grow-1">{{ perk.title }}</div>
            <div class="text-warning">{{ perk.pointPrice }}</div>
        </b-card-title>
        <b-card-text> {{ perk.description }} </b-card-text>
        <b-button variant="primary" block class="w-100" :disabled="perk.isOwned">
            <template v-if="perk.isOwned"> Claimed </template>
            <template v-else>
                Redeem for
                <strong>{{ perk.pointPrice }} points</strong>
            </template>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'BaseCardPerkERC721',
    props: {
        perk: {
            type: Object as PropType<TPerk>,
            required: true,
        },
    },
    computed: {
        imgUrl: function () {
            const attr = this.perk.metadata.attributes.find((attr) => attr.key === 'image');
            if (!attr) return '';
            return attr.value;
        },
    },
});
</script>
