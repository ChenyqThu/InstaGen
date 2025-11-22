import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getTodayUsage, UsageInfo } from '../services/usageService';

export function useUsageLimit() {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);

    const refresh = useCallback(async () => {
        if (!user?.id) {
            setUsageInfo(null);
            return;
        }

        setLoading(true);
        try {
            const info = await getTodayUsage(user.id);
            setUsageInfo(info);
        } catch (error) {
            console.error('Failed to fetch usage info:', error);
            setUsageInfo(null);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Computed properties
    const canUseService = isAuthenticated && (
        usageInfo?.hasCustomKey ||
        (usageInfo?.remaining ?? 0) > 0
    );
    const remainingCalls = usageInfo?.remaining ?? 0;
    const hasCustomKey = usageInfo?.hasCustomKey ?? false;

    return {
        // State
        loading,
        usageInfo,

        // Computed
        isAuthenticated,
        canUseService,
        remainingCalls,
        hasCustomKey,

        // Methods
        refresh,
    };
}
