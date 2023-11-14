<template>
    <blockquote>
        <div class="">
            <p class="text-opaque mb-2 d-flex justify-content-between">
                <div class="flex-grow-1">
                    Limited to <strong>{{ reward.contentMetadata.limit }} messages/day</strong> (
                        Ends <strong>in {{ reward.restartDates && formatDistance(new Date(), new Date(reward.restartDates.end), { addSuffix: false }) }}</strong>
                        and resets <strong>every {{ reward.contentMetadata.days }} days</strong>)
                </div>
                <span
                    class="justify-self-end"
                    v-b-tooltip
                    :title="reward.restartDates && `Restart: ${format(new Date(reward.restartDates.end), 'dd-MM-yyyy HH:mm')}`"
                >
                    <i class="fas fa-clock" />
                </span>
            </p>
            <b-progress
                variant="success"
                height="13px"
                show-value
                :max="reward.amount"
                :value="reward.pointsAvailable"
            />
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { formatDistance, format } from 'date-fns';

export default defineComponent({
    name: 'BaseBlockquoteDiscordMessage',
    props: {
        reward: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    data() {
        return {
            formatDistance, format
        };
    },
    methods: {},
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
