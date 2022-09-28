import CloseIcon from '@mui/icons-material/Close';
import { Button, Dialog, Slide, Stack } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { TransitionProps } from '@mui/material/transitions';
import Typography from '@mui/material/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../app/intl';
import { assertNotMaybe } from '../../app/types';
import { GameStatus, getPlayerTurns } from '../../models/game';
import { getOtherPlayerIndex } from '../../models/player';
import { setTitle } from '../meta/metaSlice';
import { ConfirmPasswordButton } from '../players/ConfirmPasswordButton';
import { selectPlayers } from '../players/playersSlice';
import {
  finishPlayerTurn,
  selectCurrentPlayer,
  selectGamePlayers,
  selectTurnHistory,
  shipTypes,
  shoot,
} from './gameSlice';
import { GameTurn } from './GameTurn';
import { useAssertGameStatus } from './hooks';
import { PlayerBoardView } from './PlayerBoardView';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  // noinspection RequiredAttributes
  return <Slide direction="up" ref={ref} {...props} />;
});

export function GamePlayPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setTitle(''));
  }, [dispatch]);

  useAssertGameStatus(GameStatus.Playing);
  const index = useAppSelector(selectCurrentPlayer);
  const gamePlayers = useAppSelector(selectGamePlayers);
  const gamePlayer = gamePlayers[index];
  const turnHistory = useAppSelector(selectTurnHistory);
  const players = useAppSelector(selectPlayers);
  const player = players[index];

  const hasShot = turnHistory[turnHistory.length - 1].cells[index].length > 0;
  const enemyIndex = getOtherPlayerIndex(index);

  const [openOwnBoard, setOpenOwnBoard] = useState(false);
  useEffect(() => setOpenOwnBoard(false), [index]);
  const handleBoardDialogClose = () => setOpenOwnBoard(false);

  const playerHistory = useMemo(() => getPlayerTurns(turnHistory, index), [turnHistory, index]);
  const enemyHistory = useMemo(
    () => getPlayerTurns(turnHistory, enemyIndex),
    [turnHistory, enemyIndex]
  );

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
          playerTurns={playerHistory}
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
      <Dialog
        open={openOwnBoard}
        fullScreen
        onClose={handleBoardDialogClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBoardDialogClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              <FormattedMessage id={MessageId.OwnBoardTitle} />
            </Typography>
            <Button autoFocus color="inherit" onClick={handleBoardDialogClose}>
              <FormattedMessage id={MessageId.CloseAction} />
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ pt: 2, pb: 4, overflow: 'auto' }}>
          <PlayerBoardView
            ships={gamePlayer.ships}
            sunkShips={gamePlayers[enemyIndex].enemySunkShips}
            board={gamePlayers[enemyIndex].enemyBoard}
            shipTypes={shipTypes}
            enemyTurns={enemyHistory}
          />
        </Container>
      </Dialog>
    </>
  );
}
