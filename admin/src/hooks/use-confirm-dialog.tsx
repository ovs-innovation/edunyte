import { useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogOptions {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogState {
  open: boolean;
  options: ConfirmDialogOptions | null;
  resolve: ((value: boolean) => void) | null;
}

export function useConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>({
    open: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        options: {
          title: options.title || 'Confirm Action',
          description: options.description,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          variant: options.variant || 'default',
        },
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state.resolve) {
      state.resolve(true);
    }
    setState({ open: false, options: null, resolve: null });
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    if (state.resolve) {
      state.resolve(false);
    }
    setState({ open: false, options: null, resolve: null });
  }, [state.resolve]);

  const ConfirmDialog = () => {
    if (!state.options) return null;

    return (
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{state.options.title}</AlertDialogTitle>
            <AlertDialogDescription>{state.options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{state.options.cancelText}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={state.options.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {state.options.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return { confirm, ConfirmDialog };
}

