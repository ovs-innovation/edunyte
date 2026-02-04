import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyBookings } from '../services/bookingService';

export const useStudentStats = () => {
    const { token } = useAuth() as any;
    const [stats, setStats] = useState({
        totalLessons: 0,
        completedLessons: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const bookings = await getMyBookings(token);
                
                const now = new Date();
                
                
                // Calculate stats based on same logic as StudentDashboardArea


                const completedBookings = bookings.filter((b: any) => {
                    const lessonDate = new Date(b.lesson.scheduledAt);
                    return lessonDate <= now || b.status === 'completed';
                });

                setStats({
                    totalLessons: bookings.length,
                    completedLessons: completedBookings.length,
                    loading: false
                });
            } catch (err) {
                console.error('Failed to fetch student stats', err);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, [token]);

    return stats;
};
