const initialState = {
  chatMessages: {},
  recentChat: [],
  fromUserJId: '',
  status: 'idle',
  error: null,
  recentChatStatus: 'idle',
};

const charReducer = (state = initialState, action) => {
  if (action.type) {
  } else {
    return state;
  }
};

export default charReducer;
