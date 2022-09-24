import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';

export function withRerenderErrorBoundary<P>(
  Component: React.ComponentType<P>,
  logError: Parameters<typeof withErrorBoundary>[1]['onError'] = (error, info) => {
    console.error('Unexpected React error, rerendering... Error:', error, info);
  }
) {
  return withErrorBoundary<P>(Component, {
    fallbackRender(props) {
      props.resetErrorBoundary();
      return <></>;
    },
    onError: logError,
  });
}
