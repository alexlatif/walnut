/**
 * Created by ebadgio on 7/24/17.
 */
import axios from 'axios';
import URL from '../../info';

const updateUserCommunityThunk = (community) => (dispatch) => {
  dispatch({type: 'HOLD_DISCOVER'});
  axios.post(URL + 'db/toggle/community', {
    communityId: community._id
  })
    .then((response) => {
      // TODO: same dispatch user reducer to update currentConversation
      dispatch({type: 'GET_USER_DATA_DONE', user: response.data.data});
      dispatch({
        type: 'GET_DISCOVER_DATA_DONE',
        otherFilters: response.data.otherFilters,
        posts: response.data.posts,
        lastRefresh: response.data.lastRefresh
      });
      setTimeout(dispatch({type: 'DISCOVER_READY'}), 1000);
    })
    .catch((err) =>{
      console.log('error in newTag', err);
    });
};
export default updateUserCommunityThunk;
