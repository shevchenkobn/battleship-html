import React, { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectDocumentTitle } from './metaSlice';

export function DocumentTitle() {
  const documentTitle = useAppSelector(selectDocumentTitle);
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return <></>;
}
