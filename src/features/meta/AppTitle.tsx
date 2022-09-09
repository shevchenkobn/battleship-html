import React from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectAppTitle } from './metaSlice';

export function AppTitle() {
  const appBarTitle = useAppSelector(selectAppTitle);

  return <>{appBarTitle}</>;
}
