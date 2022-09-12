import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { setTitle } from '../meta/metaSlice';
import { getDefaultPlayerName, PlayerProps } from './lib';
import { PlayerContainer } from './PlayerContainer';
import { isValidPlayerIndex, PlayerIndex } from './playersSlice';

export function PlayerPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const index = Number.parseInt(params.index ?? '');
  const isIndexValid = isValidPlayerIndex(index);
  const title = isIndexValid ? getDefaultPlayerName(index) : "Player's Unknown...";
  useEffect(() => {
    dispatch(setTitle(title));
  }, [dispatch, title]);
  return isIndexValid ? (
    <PlayerContainer index={index} defaultPlayerName={title} />
  ) : (
    <Typography variant="h3" gutterBottom>
      Unknown Player (wrong URL).
    </Typography>
  );
}
