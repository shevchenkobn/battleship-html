import UndoIcon from '@mui/icons-material/Undo';
import {
  Button,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Theme,
  useMediaQuery,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Link,
  Navigate,
  Outlet,
  Route,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { routes } from '../../app/routing';
import { DeepReadonly } from '../../app/types';
import { AlertDialog } from '../../components/AlertDialog';
import { MessageId, MessageParameterName, MessageWithValues } from '../../app/intl';
import { GameStatus } from '../../models/game';
import { parsePlayerIndex, PlayerKind } from '../../models/player';
import { setTitle } from '../meta/metaSlice';
import { PasswordsConfirmationContainer } from '../players/PasswordsConfirmationContainer';
import { confirmPasswords, selectPasswordsConfirmed, selectPlayers } from '../players/playersSlice';
import { useAssertGameStatus } from './hooks';
import { PlayerGameConfigurationPageFragment } from './PlayerGameConfigurationPageFragment';
import { hasShipsInstalled, selectGamePlayers, setGameStatus, startGame } from './gameSlice';

enum StepIndex {
  Player1 = 0,
  Player2 = 1,
  Confirmation = 2,
}

const stepMessages: MessageWithValues[] = [
  { id: MessageId.PlayerName, values: { [MessageParameterName.PlayerName]: 1 } },
  { id: MessageId.PlayerName, values: { [MessageParameterName.PlayerName]: 2 } },
  { id: MessageId.PasswordsConfirmationTitle },
];

export const gameRoutes = (() => {
  const routes = {
    player: {
      pathPrefix: 'player',
      path: '',
      parameterName: 'index',
      formatPath(index: number) {
        return this.pathPrefix + '/' + index;
      },
    },
    confirm: {
      path: 'confirm',
    },
  };
  routes.player.path = routes.player.pathPrefix + '/:' + routes.player.parameterName;
  return routes as DeepReadonly<typeof routes>;
})();

export function GameConfigurationPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setTitle({ id: MessageId.ConfigurationTitle }));
    return () => {
      dispatch(confirmPasswords(false));
      setNamesSameDialogOpen(false);
    };
  }, [dispatch]);

  useAssertGameStatus(GameStatus.Configuring);

  const passwordsConfirmed = useAppSelector(selectPasswordsConfirmed);
  const gamePlayers = useAppSelector(selectGamePlayers);

  const completedSteps = useMemo<Record<number, boolean>>(
    () => ({
      0: hasShipsInstalled(gamePlayers[0]),
      1: hasShipsInstalled(gamePlayers[1]),
      2: passwordsConfirmed,
    }),
    [gamePlayers, passwordsConfirmed]
  );

  const [activeStep, setActiveStep] = useState(StepIndex.Player1);
  const location = useLocation();
  const playerMatch = useMatch(routes.game.path + '/' + gameRoutes.player.path);
  const confirmMatch = useMatch(routes.game.path + '/' + gameRoutes.confirm.path);
  const navigate = useNavigate();
  useEffect(() => {
    // console.log('executed route hook');
    if (confirmMatch) {
      if (!completedSteps[StepIndex.Player1] || !completedSteps[StepIndex.Player2]) {
        navigate(gameRoutes.player.formatPath(StepIndex.Player1));
        return;
      }
      setActiveStep(StepIndex.Confirmation);
    } else if (playerMatch) {
      const index = parsePlayerIndex(playerMatch.params[gameRoutes.player.parameterName]);
      if (Number.isNaN(index) || index < StepIndex.Player1) {
        navigate(gameRoutes.player.formatPath(StepIndex.Player1));
      } else if (index > StepIndex.Player2) {
        navigate(gameRoutes.player.formatPath(StepIndex.Player2));
      } else {
        setActiveStep(index);
      }
    } else {
      console.warn('Unknown child route:', location);
    }
  }, [location, navigate, playerMatch, confirmMatch, completedSteps]);

  const [showConfigurationResetDialog, setShowConfigurationResetDialog] = useState(false);
  const handleConfigurationReset = () => {
    dispatch(setGameStatus(GameStatus.Starting));
    navigate(routes.game.path, { replace: true });
  };

  const players = useAppSelector(selectPlayers);
  const arePlayerNamesSame =
    (players[0].kind !== PlayerKind.Human && players[1].kind !== PlayerKind.Human) ||
    (players[0].kind === PlayerKind.Human &&
      players[1].kind === PlayerKind.Human &&
      players[0].name === players[1].name);
  const [namesSameDialogOpen, setNamesSameDialogOpen] = useState(false);

  const handleStartGame = () => {
    dispatch(startGame());
  };

  const matchesXs = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const startGameProps =
    activeStep === StepIndex.Confirmation && completedSteps[StepIndex.Confirmation]
      ? {
          onClick: arePlayerNamesSame
            ? () => {
                setNamesSameDialogOpen(true);
              }
            : handleStartGame,
        }
      : {
          component: Link,
          to:
            activeStep === StepIndex.Player1
              ? gameRoutes.player.formatPath(activeStep + 1)
              : gameRoutes.confirm.path,
          replace: true,
        };
  return (
    <>
      <Stack direction="column">
        <Stack direction={{ md: 'row', sm: 'column' }} spacing={{ xs: 3 }} sx={{ mb: 3 }}>
          <Button
            size="large"
            color="secondary"
            variant="text"
            startIcon={<UndoIcon />}
            onClick={() => setShowConfigurationResetDialog(true)}
          >
            <FormattedMessage id={MessageId.ResetAction} />
          </Button>
          <Stepper
            sx={{ flexGrow: 1 }}
            nonLinear
            activeStep={activeStep}
            orientation={matchesXs ? 'vertical' : 'horizontal'}
          >
            {stepMessages.map((message, index) => {
              const label =
                index === activeStep ? (
                  <Typography variant="body1">
                    <strong>
                      <FormattedMessage {...message} />
                    </strong>
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    <FormattedMessage {...message} />
                  </Typography>
                  // <FormattedMessage {...message} />
                );
              return (
                <Step key={index} completed={completedSteps[index]}>
                  {index < StepIndex.Confirmation ? (
                    <StepButton
                      component={Link}
                      to={gameRoutes.player.formatPath(index)}
                      replace={true}
                    >
                      {label}
                    </StepButton>
                  ) : completedSteps[StepIndex.Player1] && completedSteps[StepIndex.Player2] ? (
                    <StepButton component={Link} to={gameRoutes.confirm.path} replace={true}>
                      {label}
                    </StepButton>
                  ) : (
                    <StepLabel>{label}</StepLabel>
                  )}
                </Step>
              );
            })}
          </Stepper>
        </Stack>
        <Outlet />
        <Stack sx={{ mt: 2 }} direction="row" justifyContent="space-between">
          <Button
            disabled={activeStep === StepIndex.Player1}
            component={Link}
            to={gameRoutes.player.formatPath(activeStep - 1)}
            replace={true}
          >
            <FormattedMessage id={MessageId.BackAction} />
          </Button>
          <Button
            disabled={
              (activeStep === StepIndex.Player2 &&
                (!completedSteps[StepIndex.Player1] || !completedSteps[StepIndex.Player2])) ||
              (activeStep === StepIndex.Confirmation && !completedSteps[StepIndex.Confirmation])
            }
            {...startGameProps}
            variant={
              activeStep === StepIndex.Confirmation && completedSteps[StepIndex.Confirmation]
                ? 'contained'
                : 'text'
            }
            color={
              activeStep === StepIndex.Confirmation && completedSteps[StepIndex.Confirmation]
                ? 'secondary'
                : 'primary'
            }
            size={
              activeStep === StepIndex.Confirmation && completedSteps[StepIndex.Confirmation]
                ? 'large'
                : 'medium'
            }
          >
            <FormattedMessage
              id={
                activeStep === StepIndex.Confirmation
                  ? MessageId.StartGameAction
                  : MessageId.NextAction
              }
            />
          </Button>
        </Stack>
      </Stack>
      {showConfigurationResetDialog && (
        <AlertDialog
          title={<FormattedMessage id={MessageId.ConfigurationResetAlert} />}
          text={<FormattedMessage id={MessageId.UnrevertableWarning} />}
          confirmText={<FormattedMessage id={MessageId.YesAction} />}
          cancelText={<FormattedMessage id={MessageId.NoAction} />}
          onCloseAttempt={(yes) => {
            if (yes) {
              handleConfigurationReset();
            }
            setShowConfigurationResetDialog(false);
          }}
          open={showConfigurationResetDialog}
        />
      )}
      {arePlayerNamesSame && namesSameDialogOpen && (
        <AlertDialog
          title={<FormattedMessage id={MessageId.ContinueSameNameQuestion} />}
          text={<FormattedMessage id={MessageId.ContinueSameNameDescriptionQuestion} />}
          confirmText={<FormattedMessage id={MessageId.YesAction} />}
          cancelText={<FormattedMessage id={MessageId.NoAction} />}
          onCloseAttempt={(yes) => {
            if (yes) {
              handleStartGame();
            }
            setNamesSameDialogOpen(false);
          }}
          open={namesSameDialogOpen}
        />
      )}
    </>
  );
}

export function getGameConfigurationSubRoutes() {
  return [
    <Route
      key={gameRoutes.player.path}
      path={gameRoutes.player.path}
      element={<PlayerGameConfigurationPageFragment />}
    />,
    <Route
      key={gameRoutes.player.path}
      path={gameRoutes.confirm.path}
      element={<PasswordsConfirmationContainer />}
    />,
    <Route key="/" index element={<Navigate to={gameRoutes.player.formatPath(0)} />} />,
    <Route key="*" element={<Navigate to={gameRoutes.player.formatPath(0)} />} />,
  ];
}
