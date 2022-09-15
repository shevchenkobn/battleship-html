import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { routes } from '../../components/AppRouter';
import { MessageId, MessageWithValues } from '../../intl';
import { isValidPlayerIndex } from '../../models/player';
import { setTitle } from '../meta/metaSlice';
import { getIntlPlayerName } from './lib';
import { PlayerContainer } from './PlayerContainer';

export function PlayerPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const index = Number.parseInt(params[routes.player.parameterName] ?? '');
  const isIndexValid = isValidPlayerIndex(index);
  const title: MessageWithValues = useMemo(
    () => (isIndexValid ? getIntlPlayerName(index) : { id: MessageId.PlayerUnknown }),
    [index, isIndexValid]
  );
  useEffect(() => {
    dispatch(setTitle(title));
  }, [dispatch, title]);
  return isIndexValid ? (
    <PlayerContainer index={index} intlPlayerName={title} />
  ) : (
    // In this context it would make more sense to redirect to the game page, but I want to show this capability.
    <Typography variant="h3" gutterBottom>
      <FormattedMessage id={MessageId.PlayerUnknownFull} />
    </Typography>
  );
}