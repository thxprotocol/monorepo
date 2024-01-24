<template>
    <b-card
        class="mb-1"
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
                <div>
                    <b-link v-b-tooltip :title="`Ends in ${expiryDate}`" size="sm" class="ms-2" v-if="expiryDate">
                        <i class="fas fa-clock text-primary" />
                    </b-link>
                    <b-dropdown
                        v-if="infoLinks && infoLinks.length"
                        variant="link"
                        size="sm"
                        no-caret
                        toggle-class="py-0"
                        end
                    >
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item
                            @click="onClickLink(link.url)"
                            :key="key"
                            v-for="(link, key) of infoLinks"
                            link-class="d-flex align-items-center justify-content-between"
                        >
                            <div>
                                {{ link.label }}
                            </div>
                            <i class="fas fa-caret-right text-opaque"></i>
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </b-card-title>
        </template>

        <b-collapse v-model="isVisible">
            <img v-if="image" class="img-fluid" :src="image" alt="header image" />
            <div class="px-3 my-3">
                <slot></slot>
                <slot name="button"></slot>
            </div>
        </b-collapse>
    </b-card>
    <BaseModalQuestEntry
        @close="$emit('modal-close')"
        :id="id"
        :loading="loading"
        :show="completing"
        :amount="amount"
        :error="error"
    />
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { formatDistance } from 'date-fns';

export default defineComponent({
    name: 'BaseCardCollapse',
    props: {
        id: String,
        image: String,
        visible: Boolean,
        isPromoted: Boolean,
        loading: Boolean,
        completing: Boolean,
        error: String,
        amount: Number,
        infoLinks: { type: Object as PropType<{ label: string; url: string }[]>, required: false },
        quest: { required: true, type: Object as PropType<TBaseQuest & any> },
    },
    data: function () {
        return { isVisible: false };
    },
    computed: {
        expiryDate() {
            if (!this.quest.expiryDate) return '';
            return formatDistance(new Date(this.quest.expiryDate), new Date(), {
                addSuffix: false,
            });
        },
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
