<template>
    <div class="container mx-auto p-4">
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h1 class="text-2xl font-bold mb-6">Telegram Rewards Dashboard</h1>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger" role="alert">
                {{ error }}
            </div>

            <!-- Content -->
            <template v-else>
                <!-- User Stats -->
                <div v-if="userReward" class="mb-8">
                    <h2 class="text-xl font-semibold mb-4">Your Stats</h2>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card bg-primary bg-opacity-10">
                                <div class="card-body">
                                    <h3 class="card-title text-primary">Total Points</h3>
                                    <p class="display-6">{{ userReward.totalPoints }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-success bg-opacity-10">
                                <div class="card-body">
                                    <h3 class="card-title text-success">Points Today</h3>
                                    <p class="display-6">{{ getTodayPoints() }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-info bg-opacity-10">
                                <div class="card-body">
                                    <h3 class="card-title text-info">Last Activity</h3>
                                    <p class="h4">{{ formatDate(userReward.lastActivityDate) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Activity Breakdown -->
                <div v-if="userReward" class="mb-8">
                    <h2 class="text-xl font-semibold mb-4">Activity Breakdown</h2>
                    <div class="row g-4">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h3 class="card-title">Points by Activity</h3>
                                    <div class="list-group list-group-flush">
                                        <div
                                            v-for="[activity, points] in getActivityPoints()"
                                            :key="activity"
                                            class="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <span>{{ activity }}</span>
                                            <span class="badge bg-primary rounded-pill">{{ points }} points</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <h3 class="card-title">Recent Activities</h3>
                                    <div class="list-group list-group-flush">
                                        <div
                                            v-for="activity in recentActivities"
                                            :key="activity.createdAt"
                                            class="list-group-item"
                                        >
                                            <div class="d-flex justify-content-between align-items-center">
                                                <span
                                                    class="badge"
                                                    :class="getActivityBadgeClass(activity.activityType)"
                                                >
                                                    {{ activity.activityType }}
                                                </span>
                                                <small class="text-muted">{{ formatDate(activity.createdAt) }}</small>
                                            </div>
                                            <p v-if="activity.messageText" class="mb-0 mt-2 text-muted">
                                                {{ activity.messageText }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Leaderboard -->
                <div class="mb-8">
                    <h2 class="text-xl font-semibold mb-4">Top Users</h2>
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>User</th>
                                            <th>Points</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(user, index) in topUsers" :key="user.userId">
                                            <td>#{{ index + 1 }}</td>
                                            <td>@{{ user.username }}</td>
                                            <td>{{ user.totalPoints }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useTelegramStore } from '../stores/telegram.ts';
import { format } from 'date-fns';

const route = useRoute();
const store = useTelegramStore();
const { userReward, recentActivities, topUsers, loading, error } = store;

onMounted(async () => {
    const userId = Number(route.params.userId);
    if (userId) {
        await Promise.all([store.fetchUserRewards(userId), store.fetchUserActivities(userId), store.fetchTopUsers()]);
    }
});

function getTodayPoints(): number {
    if (!userReward.value) return 0;
    const today = new Date().toISOString().split('T')[0];
    return userReward.value.pointsByDate.get(today) || 0;
}

function getActivityPoints(): [string, number][] {
    if (!userReward.value) return [];
    return Array.from(userReward.value.pointsByActivity.entries());
}

function getActivityBadgeClass(activityType: string): string {
    return activityType === 'JOIN' ? 'bg-success' : 'bg-primary';
}

function formatDate(date: Date): string {
    return format(new Date(date), 'MMM d, yyyy HH:mm');
}
</script>

<style scoped>
.card {
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.badge {
    font-weight: 500;
    padding: 0.5em 0.75em;
}

.table th {
    font-weight: 600;
    color: #6c757d;
}

.list-group-item {
    border-left: none;
    border-right: none;
    padding: 1rem;
}

.list-group-item:first-child {
    border-top: none;
}

.list-group-item:last-child {
    border-bottom: none;
}
</style>
