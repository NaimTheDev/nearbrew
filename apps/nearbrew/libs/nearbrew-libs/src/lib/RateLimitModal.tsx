import { createPortal } from 'react-dom';
import { FiClock } from 'react-icons/fi';
import { NearBrewButton } from './NearBrewButton';

type RateLimitModalProps = {
  open: boolean;
  message?: string;
  onClose: () => void;
};

export function RateLimitModal({ open, message, onClose }: RateLimitModalProps) {
  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[32px] border border-border bg-card p-8 text-card-foreground shadow-[0_25px_60px_rgba(67,39,20,0.35)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FiClock className="text-2xl" />
          </div>
          <div>
            <p className="text-lg font-semibold">You&apos;re on a break</p>
            <p className="text-sm text-muted-foreground">
              You&apos;ve hit today&apos;s live forecast limit.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {message ??
            'Give it about an hour before trying again. Grab a coffee and come back soon!'}
        </p>
        <div className="mt-6 flex justify-end">
          <NearBrewButton
            onClick={onClose}
            className="bg-[#c47a3d] text-white hover:bg-[#b06c35] min-w-[120px]"
          >
            OK
          </NearBrewButton>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') {
    return modalContent;
  }

  return createPortal(modalContent, document.body);
}

export default RateLimitModal;
