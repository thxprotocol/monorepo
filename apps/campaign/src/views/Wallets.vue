<template>
    <b-container>
        <b-row>
            <b-col lg="6" offset-lg="3" class="px-0">
                <BaseCardWallets />
                <BaseCardRewards />
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseViewWallets',
});
</script>
