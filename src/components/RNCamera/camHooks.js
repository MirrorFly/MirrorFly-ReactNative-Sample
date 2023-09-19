import { useCallback, useState } from 'react';

const useCallbackRef = () => {
  const [ref, setRef] = useState(null);

  let callbackRef = useCallback(node => {
    if (node) {
      setRef(node);
    }
  }, []);

  return { ref, callbackRef };
};

export default useCallbackRef;
