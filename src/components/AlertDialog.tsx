import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
} from '@mui/material';
import { ReactNode } from 'react';

export interface AlertDialogProps extends Omit<DialogProps, 'handleClose' | 'title'> {
  title: ReactNode;
  text: ReactNode;
  confirmText: ReactNode;
  cancelText: ReactNode;
  onCloseAttempt(confirmed: boolean): void;
}

export function AlertDialog({
  title,
  text,
  confirmText,
  cancelText,
  onCloseAttempt,
  ...dialogProps
}: AlertDialogProps) {
  return (
    <Dialog
      onClose={() => onCloseAttempt(false)}
      {...dialogProps}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-text"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-text">{text}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onCloseAttempt(false)}>{cancelText}</Button>
        <Button onClick={() => onCloseAttempt(true)}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
