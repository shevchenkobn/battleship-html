import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Theme,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../app/intl';
import { assertNotMaybe } from '../../app/types';
import { GameStatus } from '../../models/game';
import { setTitle } from '../meta/metaSlice';
import { ConfirmPasswordButton } from '../players/ConfirmPasswordButton';
import { selectPlayers } from '../players/playersSlice';
import {
  finishPlayerTurn,
  selectCurrentPlayer,
  selectGamePlayers,
  selectGameStatus,
  selectTurnHistory,
  shipTypes,
  shoot,
} from './gameSlice';
import { GameTurn } from './GameTurn';
import { PlayerBoardView } from './PlayerBoardView';

export function GamePlayPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setTitle(''));
  }, [dispatch]);

  const gameStatus = useAppSelector(selectGameStatus);
  if (gameStatus !== GameStatus.Playing) {
    throw new TypeError('Unexpected non-playing game status - ' + gameStatus);
  }
  const index = useAppSelector(selectCurrentPlayer);
  const gamePlayers = useAppSelector(selectGamePlayers);
  const gamePlayer = gamePlayers[index];
  const turnHistory = useAppSelector(selectTurnHistory);
  const players = useAppSelector(selectPlayers);
  const player = players[index];
  const hasShot = turnHistory[turnHistory.length - 1].cells[index].length > 0;

  const [openOwnBoard, setOpenOwnBoard] = useState(false);
  useEffect(() => setOpenOwnBoard(false), [index]);
  const fullScreenBoardDialog = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handleBoardDialogClose = () => setOpenOwnBoard(false);

  return (
    <>
      <Stack direction="column" spacing={2} justifyContent="stretch">
        <GameTurn
          shipTypes={shipTypes}
          player={player}
          playerIndex={index}
          enemyBoard={gamePlayer.enemyBoard}
          enemySunkShips={gamePlayer.enemySunkShips}
          score={gamePlayer.score}
          turnHistory={turnHistory}
          isShooting={!hasShot}
          confirmText={
            <FormattedMessage id={hasShot ? MessageId.FinishTurnAction : MessageId.ConfirmAction} />
          }
          onConfirmClick={(cell) => {
            if (hasShot) {
              dispatch(finishPlayerTurn());
            } else {
              assertNotMaybe(cell);
              dispatch(shoot(cell));
            }
          }}
        />
        <ConfirmPasswordButton
          playerIndex={index}
          title={<FormattedMessage id={MessageId.ShowMyBoardAction} />}
          onPasswordConfirmAttempt={(confirmed) => setOpenOwnBoard(confirmed)}
        />
      </Stack>
      {openOwnBoard && (
        <Dialog
          open={openOwnBoard}
          fullScreen={fullScreenBoardDialog}
          onClose={handleBoardDialogClose}
        >
          <DialogTitle>
            <FormattedMessage id={MessageId.OwnBoardTitle} />
          </DialogTitle>
          <DialogContent>
            <PlayerBoardView
              ships={gamePlayer.ships}
              board={gamePlayer.board}
              shipTypes={shipTypes}
              turnHistory={turnHistory}
              playerIndex={index}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleBoardDialogClose} autoFocus>
              <FormattedMessage id={MessageId.CloseAction} />
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
