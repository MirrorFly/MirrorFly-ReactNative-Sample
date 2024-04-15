import React, { createRef } from 'react';

export const conversationFlatListRef = createRef(),
   conversationFlatListScrollPositionRef = createRef();

conversationFlatListRef.current = null;
conversationFlatListScrollPositionRef.current = { x: 0, y: 0 };
