import ClearIcon from '@mui/icons-material/Clear';
import {
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../app/intl';
import { DeepReadonly } from '../../app/types';
import { AlertDialog } from '../../components/AlertDialog';
import { setTitle } from '../meta/metaSlice';
import { clearScoreboard, ScoreboardEntry, selectScoreboardList } from './scoreboardSlice';

interface Column {
  id: keyof ScoreboardEntry;
  label: MessageId;
  minWidth?: number;
  align?: 'right';
  format?: <T = any>(value: T) => React.ReactNode;
}

const columns: DeepReadonly<Column[]> = [
  { id: 'playerName', label: MessageId.PlayerNameLabel },
  { id: 'totalScore', label: MessageId.Score },
  { id: 'gamesWon', label: MessageId.GameWins },
  { id: 'gamesLost', label: MessageId.GameDefeats },
];

export function ScoreboardPage() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(setTitle({ id: MessageId.ScoreboardTitle }));
  }, [dispatch]);

  const scoreboard = useAppSelector(selectScoreboardList);

  const [clearScoreboardDialogOpen, setClearScoreboardDialogOpen] = useState(false);

  return (
    <>
      <Stack>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align}>
                    <FormattedMessage id={column.label} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {scoreboard.length > 0 ? (
                scoreboard.map((row) => (
                  <TableRow hover tabIndex={-1} key={row.playerName}>
                    {columns.map((column) => (
                      <TableCell key={column.id}>{row[column.id]}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow hover tabIndex={-1}>
                  <TableCell colSpan={columns.length}>
                    <Typography variant="subtitle2">
                      <FormattedMessage id={MessageId.EmptyScoreboard} />
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="contained"
          startIcon={<ClearIcon />}
          onClick={() => setClearScoreboardDialogOpen(true)}
        >
          <FormattedMessage id={MessageId.ClearScoreboardAction} />
        </Button>
      </Stack>
      {clearScoreboardDialogOpen && (
        <AlertDialog
          title={<FormattedMessage id={MessageId.ClearScoreboardQuestion} />}
          text={<FormattedMessage id={MessageId.UnrevertableWarning} />}
          confirmText={<FormattedMessage id={MessageId.ConfirmAction} />}
          cancelText={<FormattedMessage id={MessageId.CancelAction} />}
          onCloseAttempt={(yes) => {
            if (yes) {
              dispatch(clearScoreboard());
            }
            setClearScoreboardDialogOpen(false);
          }}
          open={clearScoreboardDialogOpen}
        />
      )}
    </>
  );
}
