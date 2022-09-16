import { useMemo } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { extractStyleProps, StyleProps } from './styles';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useStyleProps(props: StyleProps): StyleProps {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => extractStyleProps(props), [props.style, props.className]);
}
