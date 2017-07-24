
const discoverReducer = (state = {
  filters: [],
  posts: []
}, action) => {
  switch (action.type) {
    case 'GET_DISCOVER_DATA_DONE':
      const newState1 = Object.assign({}, state);
      newState1.posts = newState1.posts.concat(action.posts);
      newState1.filters = newState1.posts.concat(action.filters);
      return newState1;
    case 'GET_DISCOVER_DATA_ERROR':
      return state;
    case 'TOGGLE_FILTER_FRONT':
      const newState = JSON.parse(JSON.stringify(state));
      newState.filters[action.index].checked = !newState.filters[action.index].checked;
      // return {
      //   ...state,
      //   filters: {

      //   }
      // }
      return newState;
    default:
      return state;
  }
};



export default discoverReducer;
