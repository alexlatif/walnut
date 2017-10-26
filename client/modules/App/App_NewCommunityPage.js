import React from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { Modal, Button, Icon, Input, Label, Form, Checkbox } from 'semantic-ui-react';
import createCommunityThunk from '../../thunks/community_thunks/createCommunityThunk';
import superagent from 'superagent';
import $ from 'jquery';
import { connect } from 'react-redux';
import ReactDOM from 'react-dom';

class CreateCommunityPage extends React.Component {
  constructor() {
    super();
    this.state = {
      titleValue: '',
      image: 'https://avatars2.githubusercontent.com/u/5745754?v=4&s=88',
      otherTags: [],
      filterValue: '',
      newMembers: [],
      member: '',
      file: '',
      pic: '',
      page: 1,
      status: 'public'
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // Scroll to bottom
    if (prevState.newMembers.length !== this.state.newMembers.length) {
      const len = this.state.newMembers.length - 1;
      const node = ReactDOM.findDOMNode(this['_div' + len]);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  handleChange(e) {
    this.setState({ titleValue: e.target.value });
  }

  handleFilterChange(e) {
    this.setState({ filterValue: e.target.value });
  }

  handleClickTag() {
    if (this.state.filterValue.length !== 0 ) {
      const copy = this.state.otherTags;
      copy.push(this.state.filterValue);
      this.setState({ otherTags: copy, filterValue: '' });
    }
  }

  handleMemberChange(e) {
    this.setState({ member: e.target.value });
  }

  handleMemberClick() {
    if (this.state.member.length !== 0) {
      const copy = this.state.newMembers.slice();
      copy.push(this.state.member);
      this.setState({ newMembers: copy, member: '' });
    }
  }

  handleMemberRemove(n) {
    const copy = this.state.newMembers.slice();
    copy.splice(n, 1);
    this.setState({ newMembers: copy});
  }

  handleTagRemove(n) {
    const copy = this.state.otherTags.slice();
    copy.splice(n, 1);
    this.setState({ otherTags: copy });
  }

  handleNewComm() {
    if (this.state.file !== '' && this.state.titleValue) {
      console.log('inside with pic', this.state.file, this.state.titleValue, this.state.status, this.state.otherTags);
      this.props.handleCreate(this.state.file, this.state.titleValue, this.state.status, this.state.otherTags, this.state.newMembers);
      this.setState({ titleValue: '', status: 'public', otherTags: [] });
      this.props.closeModal();
    } else if (this.state.titleValue) {
      this.props.handleCreate(this.state.image, this.state.titleValue, this.state.status, this.state.otherTags, this.state.newMembers);
      this.setState({ titleValue: '', status: 'public', otherTags: [] });
      this.props.closeModal();
    }
  }

  upload() {
    const myFile = $('#fileInputNewComm').prop('files');
    superagent.post('/aws/upload/communitypicture')
    .attach('community', myFile[0])
    .end((err, res) => {
      if (err) {
        console.log(err);
      }
      console.log('file end', res.body);
      this.setState({ file: res.body.pictureURL });
    });
  }

  handleRadio(e, val) {
    console.log('val val', val.value);
    this.setState({ status: val.value });
  }

  findEnterMember() {
    $('#memberInput').keypress((event) => {
      if (event.which === 13) {
        this.handleMemberClick();
        return false; // prevent duplicate submission
      }
      return null;
    });
  }

  findEnterTag() {
    $('#topicInput').keypress((event) => {
      if (event.which === 13) {
        this.handleClickTag();
        return false; // prevent duplicate submission
      }
      return null;
    });
  }


  render() {
    return (
        <div className="createCommunityCard">


            { this.state.page === 1 ?
            <div>
                <Modal.Header className="modalHeader">
                    <Icon className="closingIcon" name="close" onClick={() => this.props.closeModal()} />
                </Modal.Header>
                <Modal.Content scrolling>

                    <h3 id="communityPictureText">1) Community Picture</h3>
                    <input id="fileInputNewComm" type="file" onChange={() => this.upload()} />
                    {this.state.file !== '' ? <div className="imgWrapperComm"><img onClick={() => $('#fileInputNewComm').trigger('click')} className="communityImgUpload" src={this.state.file} /></div> : null }
                    {this.state.file  === '' ?
                    <div id="communityUploaderCreate">
                        <Button id="fileUploadNewComm" onClick={() => $('#fileInputNewComm').trigger('click')} className="editPicButton">Upload picture</Button>
                    </div> : null }
                    {this.state.file === '' ?
                        <img className="communityImgPre" src="https://avatars2.githubusercontent.com/u/5745754?v=4&s=88" /> : null }

                    <h3 id="communityTitleText">2) Community Title</h3>
                    <Input
                        className="titleInput"
                        value={this.state.titleValue}
                        onChange={(e) => { this.handleChange(e); }} />
                </Modal.Content>
                        <div className="pageMarker">
                            <div className="outerCircle"></div>
                            <div className="innerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                        </div>
                        <Button.Content className="nextButtonModal1" onClick={() => this.state.titleValue === '' ? null : this.setState({page: 2})} visible>Next</Button.Content>
            </div> : null }


            { this.state.page === 2 ?
            <div>
                <Modal.Header className="modalHeader">
                    <Icon className="closingIcon" name="close" onClick={() => this.props.closeModal()} />
                </Modal.Header>
                <h3 id="communityPrivacyHeader">3) Community Discovery Settings</h3>
                <Form className="privacySettings">
                    <div>
                        <Form.Field>
                            <Checkbox
                                radio
                                id="radioLabel"
                                label="Public"
                                name="checkboxRadioGroup"
                                value="public"
                                checked={this.state.status === 'public'}
                                onChange={(e, val) => this.handleRadio(e, val)}
                            />
                        </Form.Field>
                        <p className="privacySettingDesc">Community will be open and visible to the public and can be joined by anyone</p>
                    </div>
                    <div>
                        <Form.Field>
                            <Checkbox
                                radio
                                id="radioLabel"
                                label="Private"
                                name="checkboxRadioGroup"
                                value="private"
                                checked={this.state.status === 'private'}
                                onChange={(e, val) => this.handleRadio(e, val)}
                            />
                        </Form.Field>
                        <p className="privacySettingDesc">Community will be visible to the public but can only be joined by invitation or request</p>
                    </div>
                    <div>
                        <Form.Field>
                            <Checkbox
                                radio
                                id="radioLabel"
                                label="Secret"
                                name="checkboxRadioGroup"
                                value="secret"
                                checked={this.state.status === 'secret'}
                                onChange={(e, val) => this.handleRadio(e, val)}
                            />
                        </Form.Field>
                        <p className="privacySettingDesc">Community will be hidden from the public and only be joined by invite</p>
                    </div>
                </Form>
                    <Button.Content className="prevButtonModal2" onClick={() => this.setState({ page: 1 })} visible>Back</Button.Content>
                    <div className="pageMarker">
                        <div className="outerCircle"></div>
                        <div className="outerCircle"></div>
                        <div className="innerCircle1"></div>
                        <div className="outerCircle"></div>
                        <div className="outerCircle"></div>
                    </div>
                    <Button.Content className="nextButtonModal2" onClick={() => this.setState({page: 3})} visible>Next</Button.Content>
            </div> : null }


            {this.state.page === 3 ?
                <div>
                    <Modal.Header className="modalHeader">
                        <Icon className="closingIcon" name="close" onClick={() => this.props.closeModal()} />
                    </Modal.Header>
                    <h3 className="topicTitle">4) Add Default Conversation Topics:</h3>
                    <h4 className="topicIntro">Topics help your community stay organised and discover conversations more efficiently</h4>
                    <img src="https://s3-us-west-1.amazonaws.com/walnut-test/topicEg.png" className="topicPicture"/>
                    <div className="tagsDiv">
                        { this.state.otherTags.map((tag, i) =>
                            <div className="emailInnerDiv" ref={(ref) => {this['_div' + i] = ref;}}>
                                <Icon className="removeIcon" name="close" onClick={() => this.handleTagRemove(i)} />
                                <h4 className="email">
                                    # {tag}
                                </h4>
                            </div>
                        )}
                    </div>
                    <div className="addTags">
                        <Input
                            id="topicInput"
                            labelPosition="left"
                            type="text"
                            placeholder="Add Topic here..."
                            value={this.state.filterValue}
                            onChange={(e) => { this.handleFilterChange(e); this.findEnterTag(e); }} >
                            <Label basic><Icon name="hashtag" /></Label>
                            <input />
                        </Input>
                    </div>
                        <Button.Content className="prevButtonModal3" onClick={() => this.setState({ page: 2 })} visible>Back</Button.Content>
                        <div className="pageMarker">
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="innerCircle2"></div>
                            <div className="outerCircle"></div>
                        </div>
                        <Button.Content className="nextButtonModal3" onClick={() => this.setState({page: 4})} visible>Next</Button.Content>
                </div> : null}


            {this.state.page === 4 ?
                <div>
                    <Modal.Header className="modalHeader">
                        <Icon className="closingIcon" name="close" onClick={() => this.props.closeModal()} />
                    </Modal.Header>
                    <h3 className="topicTitle">5) Add Members:</h3>
                    <div className="emailDiv">
                        { this.state.newMembers.map((email, i) =>
                            <div className="emailInnerDiv" ref={(ref) => {this['_div' + i] = ref;}}>
                                <Icon className="removeIcon" name="close" onClick={() => this.handleMemberRemove(i)} />
                                <h4 className="email">
                                    {email}
                                </h4>
                            </div>
                        )}
                    </div>
                    <div className="addTags">
                        <Input
                            id="memberInput"
                            labelPosition="left"
                            type="text"
                            placeholder="Add Members..."
                            value={this.state.member}
                            onChange={(e) => { this.handleMemberChange(e); this.findEnterMember(e); }} >
                            <input />
                        </Input>
                    </div>
                        <Button.Content className="createButtonModal" onClick={() => this.handleNewComm()} visible>Create <Icon name="lightning" /></Button.Content>
                        <div className="pageMarker">
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="outerCircle"></div>
                            <div className="innerCircle3"></div>
                        </div>
                        <Button.Content className="prevButtonModal4" onClick={() => this.setState({ page: 3 })} visible>Back</Button.Content>
                </div> : null}
        </div>
    );
  }
}


CreateCommunityPage.propTypes = {
  handleCreate: PropTypes.func,
  updateUser: PropTypes.func,
  updateCommunities: PropTypes.func,
  closeModal: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
  updateUser: (user) => dispatch({ type: 'GET_USER_DATA_DONE', user }),
  updateCommunities: (communities) => dispatch({ type: 'GET_ALL_COMMUNITIES_NEW', communities }),
  handleCreate: (image, title, status, otherTags, newMembers) => dispatch(createCommunityThunk(image, title, status, otherTags, newMembers))
});

export default connect(null, mapDispatchToProps)(CreateCommunityPage);