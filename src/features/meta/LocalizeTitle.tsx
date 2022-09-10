import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { MessageId } from '../../intl';
import { selectAppLocale, selectTitle, setTitleLocalized, updateTitles } from './metaSlice';

export function LocalizeTitle() {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectAppLocale);
  useEffect(() => {
    dispatch(
      setTitleLocalized({
        isLocalized: true,
        projectName: intl.formatMessage({ id: MessageId.Name }),
      })
    );
  }, [dispatch, intl, locale]);
  useEffect(
    () => () => {
      dispatch(
        setTitleLocalized({
          isLocalized: false,
        })
      );
    },
    [dispatch]
  );

  const title = useAppSelector(selectTitle);
  useEffect(() => {
    dispatch(updateTitles(title ? intl.formatMessage({ id: title }) : title));
  }, [dispatch, intl, title]);
  return <></>;
}
