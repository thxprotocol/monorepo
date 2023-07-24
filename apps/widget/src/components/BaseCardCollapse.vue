<template>
    <b-card
        header-class="p-0"
        body-class="d-flex flex-column p-0"
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
        <b-collapse v-model="isVisible" class="p-3">
            <slot></slot>

            <b-button-group class="w-100" block v-if="infoLinks && infoLinks.length">
                <slot name="button"></slot>

                <b-dropdown right variant="primary" no-caret toggle-class="pe-3">
                    <template #button-content>
                        <i class="fas fa-caret-down"></i>
                    </template>
                    <b-dropdown-item @click="onClickLink(link.url)" :key="key" v-for="(link, key) of infoLinks">
                        {{ link.label }}
                    </b-dropdown-item>
                </b-dropdown>
            </b-button-group>
            <slot v-else name="button"></slot>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';

export default defineComponent({
    name: 'BaseCardCollapse',
    props: {
        visible: { type: Boolean },
        isPromoted: { type: Boolean },
        infoLinks: { type: Object as PropType<{ label: string; url: string }[]>, required: false },
    },
    data: function () {
        return { isVisible: false };
    },
    mounted() {
        this.isVisible = window.innerWidth > 768 || this.visible;
    },
    watch: {
        visible(value: boolean) {
            this.isVisible = window.innerWidth > 768 || value;
        },
    },
    methods: {
        onClickLink(url: string) {
            window.open(url, '_blank');
        },
    },
});
</script>
