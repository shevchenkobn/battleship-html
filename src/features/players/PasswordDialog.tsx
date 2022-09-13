import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Popover,
  TextField,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { MessageId } from '../../intl';
import LockIcon from '@mui/icons-material/Lock';

export interface PasswordDialogProps {
  correctPassword: string;
  open: boolean;
  onPasswordSubmit(confirmed: boolean): void;
  onAbortByCloseAttempt(): void;
}

export function PasswordDialog({
  correctPassword,
  open,
  onPasswordSubmit,
  onAbortByCloseAttempt,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (open) {
      setPassword('');
    }
  }, [open]);
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const intl = useIntl();

  const submitPassword = () => {
    const isValid = password === correctPassword;
    setPasswordInvalid(!isValid);
    onPasswordSubmit(isValid);
  };

  return (
    <Dialog open={open} onClose={onAbortByCloseAttempt}>
      <DialogTitle className="flex flex-wrap flex-items-center">
        <LockIcon sx={{ mr: 1 }} />{' '}
        <FormattedMessage id={MessageId.PlayerPasswordConfirmationTitle} />
      </DialogTitle>
      <DialogContent
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            submitPassword();
          }
        }}
      >
        <DialogContentText sx={{ pb: 1 }}>
          <FormattedMessage id={MessageId.PlayerPasswordConfirmationDescription} />
        </DialogContentText>
        <TextField
          type="password"
          id="confirm-password"
          value={password}
          onChange={(event) => {
            setPassword(String(event.currentTarget.value));
            setPasswordInvalid(false);
          }}
          className="w-100"
          label={intl.formatMessage({ id: MessageId.PlayerPasswordLabel })}
          error={passwordInvalid}
          helperText={passwordInvalid && intl.formatMessage({ id: MessageId.PlayerPasswordWrong })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onAbortByCloseAttempt}>
          <FormattedMessage id={MessageId.CancelAction} />
        </Button>
        <Button onClick={submitPassword}>
          <FormattedMessage id={MessageId.ConfirmAction} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
