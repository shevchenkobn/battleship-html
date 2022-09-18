import { ListItemIcon, ListItemText } from '@mui/material';
import React, { useMemo } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectAppLocale } from '../features/meta/metaSlice';
import { Locale } from '../intl';
import { languageFlags, languages } from './AppHeader';

export function useAppLanguageMenuItems(): [
  element: JSX.Element,
  locale: Locale,
  isActive: boolean
][] {
  const currentLocale = useAppSelector(selectAppLocale);

  return useMemo(
    () =>
      languages.map((item) => {
        const Icon = languageFlags[item.locale];
        return [
          <>
            <ListItemIcon>
              <Icon />
            </ListItemIcon>
            <ListItemText>{item.name}</ListItemText>
          </>,
          item.locale,
          currentLocale === item.locale,
        ];
      }),
    [currentLocale]
  );
}
