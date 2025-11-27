import { useCallback, useEffect, useRef, useState } from 'react';

export type ShareInviteStatus = 'idle' | 'copied' | 'error';

const RESET_DELAY_MS = 3000;

const hasNavigatorShare = () =>
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

const hasClipboard = () =>
  typeof navigator !== 'undefined' &&
  typeof navigator.clipboard?.writeText === 'function';

export function useShareInvite() {
  const [status, setStatus] = useState<ShareInviteStatus>('idle');
  const timeoutRef = useRef<number>();

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearTimer();
    timeoutRef.current = window.setTimeout(() => {
      setStatus('idle');
    }, RESET_DELAY_MS);
  }, [clearTimer]);

  const shareInvite = useCallback(
    async (shareData: ShareData, fallbackText: string) => {
      try {
        if (hasNavigatorShare()) {
          await navigator.share(shareData);
          setStatus('idle');
          return;
        }

        if (hasClipboard()) {
          await navigator.clipboard.writeText(fallbackText);
          setStatus('copied');
          scheduleReset();
          return;
        }

        if (typeof window !== 'undefined') {
          window.prompt('Copy this Nearbrew invite', fallbackText);
        }
      } catch (error) {
        console.error('Unable to share invite', error);
        setStatus('error');
        scheduleReset();
      }
    },
    [scheduleReset]
  );

  useEffect(
    () => () => {
      clearTimer();
    },
    [clearTimer]
  );

  return { shareInvite, status };
}
