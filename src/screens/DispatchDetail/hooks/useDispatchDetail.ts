import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DispatchApi } from '../../../api/api';
import { parseBackendError } from '../../../utils/parseError';
import { DISPATCH_STATUS_LABEL } from '../../../constants';
import type { DispatchNote, DispatchStatus, MainStackParamList } from '../../../types';

const TRANSITIONS: Record<string, { label: string; to: DispatchStatus; variant: 'primary' | 'danger' }[]> = {
    pending: [
        { label: 'Approve', to: 'approved', variant: 'primary' },
        { label: 'Dispatch Now', to: 'dispatched', variant: 'primary' },
    ],
    approved: [{ label: 'Mark Dispatched', to: 'dispatched', variant: 'primary' }],
    dispatched: [
        { label: 'Mark Delivered', to: 'delivered', variant: 'primary' },
        { label: 'Mark Returned', to: 'returned', variant: 'danger' },
    ],
    delivered: [],
    returned: [],
};

export function useDispatchDetail(dispatchId: number) {
    const nav = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const [dispatch, setDispatch] = useState<DispatchNote | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transitioning, setTransitioning] = useState(false);

    const fetchDispatch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await DispatchApi.getDispatch(dispatchId);
            setDispatch(data);
        } catch (e: any) {
            setError(parseBackendError(e));
        } finally {
            setLoading(false);
        }
    }, [dispatchId]);

    useEffect(() => { fetchDispatch(); }, [fetchDispatch]);

    function handleTransition(to: DispatchStatus) {
        if (!dispatch) return;

        const label = DISPATCH_STATUS_LABEL[to] ?? to;

        // For dispatch transition, prompt for carrier + tracking
        if (to === 'dispatched') {
            _confirmTransition(to, label, {});
            return;
        }

        _confirmTransition(to, label, {});
    }

    function _confirmTransition(to: DispatchStatus, label: string, extra: Record<string, string>) {
        Alert.alert(
            `${label}?`,
            `Move dispatch to "${label}" status?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: `Yes, ${label}`,
                    style: to === 'returned' ? 'destructive' : 'default',
                    onPress: () => _doTransition(to, extra),
                },
            ],
        );
    }

    async function _doTransition(to: DispatchStatus, extra: Record<string, string>) {
        if (!dispatch) return;
        setTransitioning(true);
        try {
            const updated = await DispatchApi.transition(dispatch.id, { status: to, ...extra });
            setDispatch(updated);
            Alert.alert('Updated', `Dispatch moved to "${DISPATCH_STATUS_LABEL[to]}".`);
        } catch (e: any) {
            const msg = parseBackendError(e);
            Alert.alert('Error', msg);
        } finally {
            setTransitioning(false);
        }
    }

    async function updateTracking(carrier: string, trackingNumber: string) {
        if (!dispatch || dispatch.status !== 'dispatched') return;
        setTransitioning(true);
        try {
            // Use patch to update carrier/tracking without changing status
            const { data } = await (await import('../../../api/api')).imsClient.patch(
                `/api/v1/dispatch/${dispatch.id}/`,
                { carrier, tracking_number: trackingNumber },
            );
            setDispatch(data.data ?? data);
            Alert.alert('Updated', 'Tracking info saved.');
        } catch (e: any) {
            Alert.alert('Error', 'Failed to update tracking info.');
        } finally {
            setTransitioning(false);
        }
    }

    const actions = dispatch ? (TRANSITIONS[dispatch.status] ?? []) : [];

    return {
        dispatch, loading, error, transitioning, actions,
        handleTransition, updateTracking, refresh: fetchDispatch,
    };
}