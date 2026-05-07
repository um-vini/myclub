import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import type { ReactNode } from 'react';

/**
 * Props for the ConfirmAction component.
 * Allows customization of the confirmation dialog and its trigger.
 */
interface ConfirmActionProps {
  /** The element that triggers the dialog (Button, DropdownItem, Icon, etc.) */
  trigger: ReactNode;
  title: string;
  description: string;
  /** Callback function executed when the user confirms the action */
  onConfirm: () => void;
  /** Visual theme for the confirmation button */
  variant?: 'default' | 'destructive';
}

export function ConfirmAction({
  trigger,
  title,
  description,
  onConfirm,
  variant = 'destructive',
}: ConfirmActionProps) {
  return (
    <AlertDialog>
      {/* 'asChild' is used to allow the trigger to be any custom element passed as prop */}
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : ''
            }
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
