<template>
    <b-container class="py-5 text-white">
        <h1>Collections</h1>
        <p class="lead">Design custom NFT collections</p>
        <b-button variant="dark" to="/collections/create">
            Create Collection
            <BaseIcon icon="chevron-right" class="ms-2" />
        </b-button>
    </b-container>
    <div class="bg-dark text-white py-5 flex-grow-1">
        <b-container>
            <b-card variant="darker">
                <BaseTableCollections />
            </b-card>
        </b-container>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Collections',
});
</script>
