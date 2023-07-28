const initialState = {
  chatMessages: {},
  recentChat: [],
  fromUserJId: '',
  status: 'idle',
  error: null,
  recentChatStatus: 'idle',
};

const charReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default charReducer;
