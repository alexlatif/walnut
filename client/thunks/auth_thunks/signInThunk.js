
import firebase from 'firebase';
import axios from 'axios';
import URL from '../../info';

const signInThunk = (email, password, redirect) => (dispatch) => {
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(result => {
    console.log('RESULT HERE', result);
    if (!result.emailVerified) {
      dispatch({type: 'GET_USER_VERIFY_ERROR', email: email, password: password});
    }
    result.getIdToken(/* forceRefresh */ true)
    .then((idToken) => {
      console.log('the fucking token', idToken);
      axios.post(URL + 'auth/login', {
        token: idToken,
        email: email,
        password: password
      })
      .then((res) => {
        dispatch({type: 'GET_USER_DATA_DONE', user: res.data.user});
        setTimeout(() => dispatch({type: 'WALNUT_READY'}), 1500);
        // redirect('/community/' + res.data.user.currentCommunity.title.split(' ').join('') + '/discover');
        // history.replace('/');
        // console.log('history', history);
        // axios.get(URL);
      });
    })
  .catch(function(error) {
    // Handle Errors here.
    console.log('you got a fucking error', error);
    const errorCode = error.code;
    const errorMessage = error.message;
    dispatch({type: 'GET_USER_DATA_ERROR'});
    // ...
  });
  })
  .catch(function(error) {
    // Handle Errors here.
    console.log('you got a fucking error', error);
    const errorCode = error.code;
    const errorMessage = error.message;
    dispatch({type: 'GET_USER_DATA_ERROR'});
  });
};

  // firebase.auth().onAuthStateChanged(function(user) {
  //   console.log('user', user);
  //   if (user) {
  //     console.log('user was logged in', user);
  //       // if(req.user.hasProfile) {
  //       //   if (req.user.currentCommunity) {
  //       //       User.findById(req.user._id)
  //       //           .populate('currentCommunity')
  //       //           .then((user) => {
  //       //               const url = '/community/' + user.currentCommunity.title.split(' ').join('') + '/discover';
  //       //               res.redirect(url);
  //       //           })
  //       //   }
  //       //   else {
  //       //     res.redirect('/app/walnuthome')
  //       //   }
  //       // } else{
  //       //   res.redirect('/app/editprofile');
  //       // }
  //   } else {
  //     console.log('user not validated');
  //   }
  // });

export default signInThunk;
