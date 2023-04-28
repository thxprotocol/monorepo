<template>
    <b-card
        header-class="p-0"
        body-class="d-flex flex-column p-0"
        class="m-2"
        :class="{ 'card-collapsed': isVisible, 'card-promoted': isPromoted }"
    >
        <template #header>
            <b-card-title
                @click.stop="isVisible = !isVisible"
                class="d-flex p-3 m-0 align-items-center"
                style="cursor: pointer"
            >
                <slot name="header"></slot>
            </b-card-title>
        </template>
        <b-collapse v-model="isVisible" class="p-3"> <slot></slot> </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardCollapse',
    props: {
        visible: { type: Boolean },
        isPromoted: { type: Boolean },
    },
    data: function () {
        return { isVisible: false };
    },
    mounted() {
        this.isVisible = this.visible;
    },
});
</script>
