
// our states will be center and zoom

const mapReducer = (state = {
  selected: 'live',
  center: [-103.59179687498357, 40.66995747013945],
  zoom: [3],
  data: []
}, action) => {
  switch (action.type) {
    case 'NEW_CENTER':
      return {
        ...state,
        center: action.center
      };
    case 'UPDATE_ZOOM':
      return {
        ...state,
        zoom: [10]
      };
    case 'CHANGE_CATEGORY':
      return {
        ...state,
        selected: action.selected
      };
    default:
      return state;
  }
};

export default mapReducer;