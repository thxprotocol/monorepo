<template>
    <blockquote>
        <div class="">
            <p class="text-opaque mb-1 d-flex justify-content-between">
                <b-col class="flex-grow-1">
                    <strong>Daily Limit</strong><br />
                    Reset in
                    {{
                        reward.restartDates &&
                        formatDistance(new Date(reward.restartDates.now), new Date(reward.restartDates.endDay), {
                            addSuffix: false,
                        })
                    }}
                </b-col>
                <b-col>
                    <p>
                        - {{ reward.contentMetadata.limit }} messages/day<br />
                        - {{ reward.contentMetadata.days * reward.contentMetadata.limit }} messages/{{
                            reward.contentMetadata.limit
                        }}
                        days
                    </p>
                </b-col>
            </p>
            <BarChart :height="100" :chartData="chartData" :options="options" />
        </div>
    </blockquote>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { formatDistance, format } from 'date-fns';
import { Chart, registerables } from 'chart.js';
import { BarChart } from 'vue-chart-3';
import { useAccountStore } from '../../stores/Account';

Chart.register(...registerables);

export default defineComponent({
    name: 'BaseBlockquoteDiscordMessage',
    components: {
        BarChart,
    },
    props: {
        reward: {
            type: Object as PropType<TQuestSocial>,
            required: true,
        },
    },
    data(): any {
        return {
            format,
            formatDistance,
            options: {
                scales: {
                    y: {
                        display: false,
                    },
                    x: {
                        display: false,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                elements: {
                    bar: {
                        borderRadius: 3,
                    },
                },
            },
        };
    },
    computed: {
        chartData() {
            if (!this.reward.restartDates || !this.reward.messages) return;
            let currentDate = new Date(this.reward.restartDates.start);
            const endDate = new Date(this.reward.restartDates.end);
            const group: any = {};

            while (currentDate.getTime() <= endDate.getTime()) {
                const day = currentDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD
                group[day] = [];
                currentDate.setDate(currentDate.getDate() + 1);
            }

            for (const message of this.reward.messages) {
                const day = new Date(message.createdAt).toISOString().split('T')[0];
                group[day] = group[day] || [];
                group[day].push(message);
            }

            const labels = Object.keys(group);
            const data = Object.values(group).map((messages: any) => messages.length);
            const theme = JSON.parse(useAccountStore().config.theme);

            return {
                labels,
                datasets: [{ data, backgroundColor: Object.values(group).map(() => theme.colors.accent.color) }],
            };
        },
    },
});
</script>
<style scoped>
a {
    text-decoration: none;
}
</style>
