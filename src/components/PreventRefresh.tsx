import { useEffect } from 'react';

export function PreventRefresh() {
  useEffect(() => {
    let callbackExecuted = false;
    const callback = (event: BeforeUnloadEvent) => {
      if (callbackExecuted) {
        return;
      }
      const message = 'If your reload, your data will be lost!';
      event.returnValue = message;
      event.preventDefault();
      callbackExecuted = true;
      return message;
    };
    window.addEventListener('beforeunload', callback);
    window.addEventListener('unload', callback);
    return () => {
      window.removeEventListener('beforeunload', callback);
      window.removeEventListener('unload', callback);
    };
  }, []);
  return <></>;
}
