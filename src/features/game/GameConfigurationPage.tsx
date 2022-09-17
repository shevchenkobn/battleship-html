import CancelIcon from '@mui/icons-material/Cancel';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Button,
  Stack,
  Step,
  StepButton,
  StepContent,
  StepLabel,
  Stepper,
  Theme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Link,
  Navigate,
  Route,
  Routes,
  Outlet,
  useLocation,
  useMatch,
  useNavigate,
} from 'react-router-dom';
import theme from 'tailwindcss/defaultTheme';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { DeepReadonly } from '../../app/types';
import { routes } from '../../components/AppRouter';
import { MessageId, MessageParameterName, MessageWithValues } from '../../intl';
import { GameStatus, hasShipsInstalled } from '../../models/game';
import { parsePlayerIndex, PlayerIndex } from '../../models/player';
import { setTitle } from '../meta/metaSlice';
import { GamePlayerConfigurationPageFragment } from './GamePlayerConfigurationPageFragment';
import { selectGameConfigurationConfirmed, selectGamePlayers, setStatus } from './gameSlice';

type StepIndex = PlayerIndex | 2;

const steps: MessageWithValues[] = [
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
  }, [dispatch]);

  const passwordsConfirmed = useAppSelector(selectGameConfigurationConfirmed);
  const gamePlayers = useAppSelector(selectGamePlayers);

  const completedSteps = useMemo<Record<number, boolean>>(
    () => ({
      0: hasShipsInstalled(gamePlayers[0]),
      1: hasShipsInstalled(gamePlayers[1]),
      2: passwordsConfirmed,
    }),
    [gamePlayers, passwordsConfirmed]
  );

  const [activeStep, setActiveStep] = useState(0);
  const location = useLocation();
  const playerMatch = useMatch(routes.game.path + '/' + gameRoutes.player.path);
  const confirmMatch = useMatch(routes.game.path + '/' + gameRoutes.confirm.path);
  const navigate = useNavigate();
  useEffect(() => {
    console.log('executed route hook');
    if (confirmMatch) {
      if (!completedSteps[0] || !completedSteps[1]) {
        navigate(gameRoutes.player.formatPath(0));
        return;
      }
      setActiveStep(2);
    } else if (playerMatch) {
      const index = parsePlayerIndex(playerMatch.params[gameRoutes.player.parameterName]);
      if (Number.isNaN(index) || index < 0) {
        navigate(gameRoutes.player.formatPath(0));
      } else if (index > 1) {
        navigate(gameRoutes.player.formatPath(1));
      } else {
        setActiveStep(index);
      }
    } else {
      console.warn('Unknown child route:', location);
    }
  }, [location, navigate, playerMatch, confirmMatch, completedSteps]);

  const theme = useTheme();
  const matchesXs = useMediaQuery<Theme>(theme.breakpoints.down('sm'));
  return (
    <Stack>
      <Stack direction={{ md: 'row', sm: 'column' }} spacing={{ xs: 2 }}>
        <Button
          size="large"
          color="secondary"
          variant="contained"
          startIcon={<UndoIcon />}
          component={Link}
          to={routes.game.path}
          replace={true}
          onClick={() => dispatch(setStatus(GameStatus.Starting))}
        >
          <FormattedMessage id={MessageId.ResetAction} />
        </Button>
        <Stepper
          sx={{ flexGrow: 1 }}
          nonLinear
          activeStep={activeStep}
          orientation={matchesXs ? 'vertical' : 'horizontal'}
        >
          {steps.map((message, index) => {
            const label = <FormattedMessage {...message} />;
            return (
              <Step key={index} completed={completedSteps[index]}>
                {index < 2 ? (
                  <StepButton
                    component={Link}
                    to={gameRoutes.player.formatPath(index)}
                    replace={true}
                  >
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
    </Stack>
  );
}

export function getGameConfigurationSubRoutes() {
  return [
    <Route
      key={gameRoutes.player.path}
      path={gameRoutes.player.path}
      element={<GamePlayerConfigurationPageFragment />}
    />,
    <Route key={gameRoutes.player.path} path={gameRoutes.confirm.path} element={<>confirm</>} />,
    <Route key="/" index element={<Navigate to={gameRoutes.player.formatPath(0)} />} />,
    <Route key="*" element={<Navigate to={gameRoutes.player.formatPath(0)} />} />,
  ];
}
