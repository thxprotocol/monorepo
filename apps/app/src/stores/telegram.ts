import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

interface UserReward {
    userId: number;
    username: string;
    totalPoints: number;
    pointsByDate: Map<string, number>;
    pointsByActivity: Map<string, number>;
    isRegistered: boolean;
    lastActivityDate: Date;
    claimedRewards: string[];
}

interface UserActivity {
    userId: number;
    username: string;
    firstName: string;
    lastName?: string;
    activityType: string;
    messageId?: number;
    messageText?: string;
    channelId: string;
    pointsEarned: number;
    createdAt: Date;
}

export const useTelegramStore = defineStore('telegram', () => {
    const userReward = ref<UserReward | null>(null);
    const recentActivities = ref<UserActivity[]>([]);
    const topUsers = ref<UserReward[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function fetchUserRewards(userId: number) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/api/telegram/rewards/${userId}`);
            userReward.value = response.data;
        } catch (err) {
            error.value = 'Failed to fetch user rewards';
            console.error('Error fetching user rewards:', err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchUserActivities(userId: number, limit = 10) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`/api/telegram/activities/${userId}`, {
                params: { limit },
            });
            recentActivities.value = response.data;
        } catch (err) {
            error.value = 'Failed to fetch user activities';
            console.error('Error fetching user activities:', err);
        } finally {
            loading.value = false;
        }
    }

    async function fetchTopUsers(limit = 10) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get('/api/telegram/leaderboard', {
                params: { limit },
            });
            topUsers.value = response.data;
        } catch (err) {
            error.value = 'Failed to fetch top users';
            console.error('Error fetching top users:', err);
        } finally {
            loading.value = false;
        }
    }

    return {
        userReward,
        recentActivities,
        topUsers,
        loading,
        error,
        fetchUserRewards,
        fetchUserActivities,
        fetchTopUsers,
    };
});
