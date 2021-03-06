/* eslint-disable no-trailing-spaces */
import React from 'react';
import PropTypes from 'prop-types';
import { connect} from 'react-redux';
import axios from 'axios';
import MediaAttachment from './Post_Media_Attachment.js';
import LinkPreview from './LinkPreview';
import './Post.css';
import Lightbox from 'react-images';
import {Divider, Icon, Loader, Dropdown, Form, TextArea, Segment} from 'semantic-ui-react';
import dateStuff from '../../dateStuff';
import firebaseApp from '../../firebase';
import _ from 'underscore';
import getPostFollowersThunk from '../../thunks/post_thunks/getPostFollowers';
import editPostThunk from '../../thunks/post_thunks/editPostThunk';
import NewMemberBanner from './Post_NewMember';


class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nested: this.props.nested,
      lightBoxData: '',
      pdfModalData: '',
      page: 1,
      pages: 100,
      urls: [],
      messageBody: '',
      messageBody1: '',
      messageBody2: '',
      newLink: '',
      urlName: '',
      members: [],
      count: 0,
      unreads: 0,
      numFollowers: 0,
      showDrawer: false,
      isFollowing: false,
      meta: {},
      loading: false,
      postData: this.props.postData,
      minHeighter: 100
    };
    this.getUseDate = this.getUseDate.bind(this);
  }

  componentWillMount() {
    this.getLinkPreview(this.props.postData);
  }

  componentDidMount() {
    setTimeout(() => {
      const elem = document.getElementById(this.props.postData.postId);
      if (elem) {
        this.setState({minHeighter: elem.clientHeight + 20});
      }
    }, 7500);

    const user = firebaseApp.auth().currentUser;
    this.setState({ user: user, timeStamp: this.getUseDate(this.props.postData.createdAt)});
    const membersRef = firebaseApp.database().ref('/members/' + this.props.postData.postId);
    membersRef.on('value', (snapshot) => {
      const peeps =  _.values(snapshot.val());
      const members = peeps.filter((peep) => typeof (peep) === 'object');
      this.setState({membersCount: members.length, members: members});
    });
    const countRef = firebaseApp.database().ref('/counts/' + this.props.postData.postId + '/count');
    countRef.on('value', (snapshot) => {
      if (snapshot.val()) {
        this.setState({count: snapshot.val()});
      }
    });

    // Determining if this user follows this post
    const followsRef = firebaseApp.database().ref('/follows/' + user.uid + '/' + this.props.currentUser.currentCommunity._id + '/' +  this.props.postData.postId);
    followsRef.on('value', (snapshot) => {
      if (snapshot.val()) {
        this.setState({isFollowing: true});
      } else {
        this.setState({isFollowing: false});
      }
    });

    // Getting # followers of this post
    const followersRef = firebaseApp.database().ref('/followGroups/' + this.props.postData.postId);
    followersRef.on('value', (snapshot) => {
      if (snapshot.val()) {
        const followers = Object.keys(snapshot.val());
        this.props.getPostFollowers(followers);
        this.setState({numFollowers: followers.length});
      }
    });


    // unreads stuff
    firebaseApp.database().ref('/unreads/' + user.uid + '/' + this.props.postData.postId).on('value', snapshotB => {
      const unreadCount =  snapshotB.val();
      if (!isNaN(unreadCount) && unreadCount !== null) {
        this.setState({unreads: unreadCount});
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    // Only want it do something if its waiting for edit response (i.e if its loading)
    if (this.state.loading) {
      if (!nextProps.saving) {
        if (!nextProps.saveError) {
          this.getLinkPreview(nextProps.savedPost);
          this.setState({loading: false, success: true, showStatus: true, postData: nextProps.savedPost});
          setTimeout(() => {this.setState({showStatus: false}); this.props.finishEdit();}, 1000);
        } else {
          this.setState({loading: false, success: false, showStatus: true});
          setTimeout(() => {this.setState({showStatus: false}); this.props.finishEdit();}, 1000);
        }
      }
    }
  }

  getLinkPreview(postData) {
    const urls = this.urlFinder(postData.content);
    if (urls.length === 0) {
      this.setState({ messageBody: postData.content });
      return false;
    }
    axios.post('/db/get/linkpreview', {
      url: urls[0]
    })
    .then((response) => {
      this.setState({ meta: response.data.meta });
      if (urls.length !== 0) {
        const idx = postData.content.indexOf(urls[0]);
        const newBody1 = postData.content.substr(0, idx);
        const newBody2 = postData.content.substr((idx + urls[0].length), postData.content.length);
        const newLink = urls[0];
        if (!response.data.meta.description || !response.data.meta.title || !response.data.meta.image) {
          this.setState({ messageBody1: newBody1, messageBody2: newBody2, newLink: newLink });
        } else {
          this.setState({ messageBody1: newBody1, messageBody2: newBody2, newLink: newLink, urlName: this.urlNamer(newLink) });
        }
      }
    })
    .catch((err) => {
      console.log('error in meta scrape', err);
    });
  }

  getUseDate(dateObj) {
    if (dateObj) {
      const now = new Date().toString().slice(4, 24).split(' ');
      const date = new Date(dateObj);
      const dateString = date.toString().slice(4, 24);
      const split = dateString.split(' ');
      const useMonth = dateStuff.months[split[0]];
      const useDay = dateStuff.days[split[1]];
      const timeArr = split[3].split(':');
      let time;
      let hour;
      let isPM;
      if (parseInt(timeArr[0], 10) > 12) {
        hour = parseInt(timeArr[0], 10) - 12;
        isPM = true;
      } else if (parseInt(timeArr[0], 10) === 12) {
        hour = 12;
        isPM = true;
      } else {
        if (parseInt(timeArr[0], 10) === 0) {
          hour = 12;
        } else {
          hour = parseInt(timeArr[0], 10);
        }
      }
      const min = timeArr[1];
      if (isPM) {
        time = hour + ':' + min + 'PM';
      } else {
        time = hour + ':' + min + 'AM';
      }
      if (now[2] !== split[2]) {
        return useMonth + ' ' + useDay + ', ' + split[2] + ' ' + time;
      }
      return useMonth + ' ' + useDay + ', ' + time;
    }
    return '-';
  }

  urlNamer(url) {
    const arr = url.split('/')[2].split('.');
    let name = '';
    if (arr.length === 2) {
      name = arr[0];
    } else {
      name = arr[1];
    }
    return name;
  }

  urlFinder(text) {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    const urls = [];
    text.replace(urlRegex, (url, b, c) => {
      const url2 = (c === 'www.') ? 'http://' + url : url;
      urls.push(url2);
    });
    return urls;
  }

  renderLightBox(data) {
    this.setState({lightBoxData: data});
  }

  closeLightbox() {
    this.setState({lightBoxData: ''});
  }

  renderPdfModal(data) {
    this.setState({pdfModalData: data});
  }

  joinConversation() {
    const updates = {};
    updates['/follows/' + this.state.user.uid + '/' +
    this.props.currentUser.currentCommunity._id +
          '/' + this.props.postData.postId] = true;
    updates['/followGroups/' + this.props.postData.postId +
          '/' + this.state.user.uid] = true;
    firebaseApp.database().ref().update(updates);
  }

  // Don't delete, will use it eventually
  leaveConversation() {
    const updates = {};
    updates['/follows/' + this.state.user.uid + '/'
            + this.props.currentUser.currentCommunity._id + '/' +
            this.props.postData.postId] = null;
    updates['/followGroups/' + this.props.postData.postId + '/' + this.state.user.uid] = null;
    firebaseApp.database().ref().update(updates);
  }

  closeModal() {
    this.setState({ pdfUrl: '', page: 1 });
  }

  handlePrevious() {
    if(this.state.page === 1) {
      this.setState({ page: this.state.pages });
    } else {
      this.setState({ page: this.state.page - 1 });
    }
  }

  handleNext() {
    if(this.state.page === this.state.pages) {
      this.setState({ page: 1 });
    } else {
      this.setState({ page: this.state.page + 1 });
    }
  }

  onDocumentComplete(pages) {
    this.setState({ page: 1, pages: pages });
  }

  onPageComplete(page) {
    this.setState({ page: page });
  }

  closePdfModal() {
    this.setState({pdfModalData: ''});
  }

  closeDownloadModal() {
    this.setState({downloadUrl: ''});
  }

  startEdit() {
    this.props.beginEdit();
    this.setState({editing: true});
    setTimeout(() => {
      const elem = document.getElementById('editTextarea');
      elem.value = this.props.postData.content;
    }, 300);
  }

  savePost() {
    const elem = document.getElementById('editTextarea');
    this.props.editPost(elem.value, this.props.postData.postId);
    this.setState({editing: false, loading: true});
  }

  render() {
    const { minHeighter } = this.state;
    if (this.props.newMemberBanner) {
      return (<NewMemberBanner data={this.props.postData} />);
    } else if (this.state.loading) {
      return(
          <div className="postOuter">
            <Segment className={this.state.showDrawer ? 'postSegmentDrawerOpen' : 'postSegment'}>
              <div className="postContent">
                <div className="postUser" id="postUser">
                  <div className="imageWrapperPost">
                    <img className="postUserImage" src={this.state.postData.pictureURL} />
                  </div>
                  <div className="postHeader">
                    <h3 className="postHeaderUser">{this.state.postData.username}</h3>
                    <p className="postTimeStamp">{this.state.timeStamp}</p>
                      {this.state.postData.edited ? <p className="isEdited">(edited)</p> : null}
                  </div>
                    {this.state.isFollowing ? <div className="isFollowingGroup">
                      <Icon name="checkmark" className="iconFollowing" size={'small'} />
                      <p className="followingText">Following</p>
                    </div> : <div className="postFollowButton" onClick={() => this.joinConversation()}>
                      <Icon name="plus" className="followIcon" />
                      Follow
                    </div>}
                  <Dropdown className="postDropdown" icon={'ellipsis horizontal'}>
                    <Dropdown.Menu>
                        {!this.state.isFollowing ?
                            <Dropdown.Item icon="plus" onClick={() => this.joinConversation()} text="Follow" /> :
                            <Dropdown.Item text="Unfollow" onClick={() => this.leaveConversation()} />}
                        {this.props.currentUser.fullName === this.state.postData.username ?
                            <Dropdown.Item icon="edit" text="Edit post" onClick={() => this.startEdit()} /> : null}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <div className="postDescription">
                  <div className="postInnerContent">
                    <Loader active/>
                  </div>
                </div>
              </div>
              <div className="statsGroup">
                <span className="activeNum">
                  {this.state.membersCount > 0 ? this.state.membersCount + ' active' : null}
                </span>
                    <span className="followNum">
                      {this.state.numFollowers}{this.state.numFollowers === 1 ? ' follower' : ' followers'}
                </span>
                    <span className="commentNum">
                      {this.state.count}{' messages'}
                </span>
                      {this.state.isFollowing ? <span className={this.state.unreads > 0 ? 'isUnread' : 'noUnread'}>
                      {this.state.unreads}{' unread'}
                </span> : null}
              </div>
              <Divider className="postDivider" fitted />
              <div className="postFootnote">
                <div className="tagContainer">
                    {this.state.postData.tags ? this.state.postData.tags.map((tag, index) => (
                        <div key={index} className="tag">
                          <text className="hashtag">#{' ' + tag.name}</text>
                        </div>)) : null}
                </div>
                <div></div>
                <div className="commentDiv" id="commentDiv">
                  <div className="messagesGroup" onClick={() => this.props.addChat(this.state.postData)}>
                    <Icon size="big" name="comments outline" className="commentIcon" />
                    <p className="messageText">Chat</p>
                  </div>
                </div>
              </div>
            </Segment>
          </div>
      );
    }
    return (
      <div className="postOuter">
        <Segment className={this.state.showDrawer ? 'postSegmentDrawerOpen' : 'postSegment'}>
          <div className="postContent">
            <div className="postUser" id="postUser">
              <div className="imageWrapperPost">
                  <img className="postUserImage" src={this.state.postData.pictureURL} />
              </div>
              <div className="postHeader">
                <h3 className="postHeaderUser">{this.state.postData.username}</h3>
                <p className="postTimeStamp">{this.state.timeStamp}</p>
                  {this.state.postData.edited ? <p className="isEdited">(edited)</p> : null}
              </div>
                {this.state.showStatus ?
                    <div>{this.state.success ?
                        <span className="successSave">Save successful!</span> :
                        <span className="failSave">Something went wrong...</span>}
                    </div> : null}
                {this.state.isFollowing ? <div className="isFollowingGroup">
                  <Icon name="checkmark" className="iconFollowing" size={'small'} />
                  <p className="followingText">Following</p>
                </div> : <div className="postFollowButton" onClick={() => this.joinConversation()}>
                  <Icon name="plus" className="followIcon" />
                  Follow
                </div>}
                {this.state.nested ? null : <Dropdown className="postDropdown" icon={'ellipsis horizontal'}>
                <Dropdown.Menu>
                    {!this.state.isFollowing ?
                        <Dropdown.Item icon="plus" onClick={() => this.joinConversation()} text="Follow" /> :
                        <Dropdown.Item text="Unfollow" onClick={() => this.leaveConversation()} />}
                    {this.props.currentUser.fullName === this.state.postData.username ?
                        <Dropdown.Item icon="edit" text="Edit post" onClick={() => this.startEdit()} /> : null}
                </Dropdown.Menu>
              </Dropdown>}
            </div>
              {!this.state.editing ?
                  <div>
                      <div className="postDescription">
                        <div className="postInnerContent" id={this.state.postData.postId}>
                          {this.state.messageBody ? this.state.messageBody :
                        <div>{this.state.messageBody1 + ' ' + this.state.messageBody2}</div>
                          }
                        </div>
                      </div>
                      {this.state.meta.description && this.state.meta.title && this.state.meta.image ?
                          <LinkPreview meta={this.state.meta} url={this.state.newLink} /> :
                          <a target="_blank" className="noMeta" href={this.state.newLink}>{this.state.newLink}</a>}
                      </div>
                      : <div className="postDescription">
                          <div className="postInnerContent">
                            <Form className="editPostForm">
                              <TextArea
                                id="editTextarea"
                                style={{minHeight: minHeighter}}
                                autoHeight/>
                            </Form>
                          </div>
                        </div>}
              {this.state.editing ? <div className="savePostButton" onClick={() => this.savePost()}>Save</div> : null}
            {(this.state.postData.attachment.name !== '') ?
            <MediaAttachment data={this.state.postData.attachment}
            renderLightBox={(data) => this.renderLightBox(data)}
            renderPdfModal={(data) => this.renderPdfModal(data)}/>
            : null}
            <Lightbox
              images={[{
                src: this.state.lightBoxData.url,
                caption: this.state.lightBoxData.name
              }]}
              isOpen={this.state.lightBoxData !== ''}
              onClose={() => this.closeLightbox()}
              />
          </div>
          <div className="statsGroup">
            <span className="activeNum">
              {this.state.membersCount > 0 ? this.state.membersCount + ' active' : null}
            </span>
            <span className="followNum">
                  {this.state.numFollowers}{this.state.numFollowers === 1 ? ' follower' : ' followers'}
            </span>
            <span className="commentNum">
                  {this.state.count}{' messages'}
            </span>
            {this.state.isFollowing ? <span className={this.state.unreads > 0 ? 'isUnread' : 'noUnread'}>
                  {this.state.unreads}{' unread'}
            </span> : null}
          </div>
          <Divider className="postDivider" fitted />
          <div className="postFootnote">
            <div className="tagContainer">
              {this.state.postData.tags.map((tag, index) => (
              <div key={index} className="tag">
                <text className="hashtag">#{' ' + tag.name}</text>
              </div>))}
            </div>
            <div></div>
              {this.props.nested ? null : <div className="commentDiv" id="commentDiv">
              <div className="messagesGroup" onClick={() => this.props.addChat(this.state.postData)}>
                <Icon size="big" name="comments outline" className="commentIcon" />
                <p className="messageText">Chat</p>
              </div>
            </div>}
          </div>
        </Segment>
      </div>
    );
  }
}
Post.propTypes = {
  postData: PropTypes.object,
  newLike: PropTypes.func,
  currentUser: PropTypes.object,
  nested: PropTypes.bool,
  getPostFollowers: PropTypes.func,
  addChat: PropTypes.func,
  editPost: PropTypes.func,
  savedPost: PropTypes.object,
  saving: PropTypes.bool,
  saveError: PropTypes.bool,
  beginEdit: PropTypes.func,
  finishEdit: PropTypes.func,
  newMemberBanner: PropTypes.object
};

const mapDispatchToProps = (dispatch) => ({
  beginEdit: () =>  dispatch({type: 'STARTED_EDITING'}),
  finishEdit: () => dispatch({type: 'EVERYTHING_DONE'}),
  getPostFollowers: (followerIds) => dispatch(getPostFollowersThunk(followerIds)),
  addChat: (postData) => dispatch({type: 'ADD_CHAT', postData: postData}),
  editPost: (newPostData, postId) => dispatch(editPostThunk(newPostData, postId))
});

const mapStateToProps = (state) => ({
  savedPost: state.editPostReducer.edited,
  saving: state.editPostReducer.saving,
  saveError: state.editPostReducer.saveError
});

export default connect(mapStateToProps, mapDispatchToProps)(Post);
