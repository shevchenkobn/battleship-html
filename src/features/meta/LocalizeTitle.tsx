import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ia, MessageId } from '../../intl';
import { selectAppLocale, selectTitle, setTitleLocalized, updateTitles } from './metaSlice';

export function LocalizeTitle() {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const locale = useAppSelector(selectAppLocale);
  useEffect(() => {
    dispatch(
      setTitleLocalized({
        isLocalized: true,
        projectName: intl.formatMessage({ id: MessageId.ProjectName }),
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
    dispatch(updateTitles(typeof title !== 'string' ? intl.formatMessage(...ia(title)) : title));
  }, [dispatch, intl, title]);
  return <></>;
}
