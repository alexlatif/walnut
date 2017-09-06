// renders in App
import React from 'react';
import {Link} from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Icon, Dropdown, Button } from 'semantic-ui-react';
import './App.css';
import signOutThunk from '../../thunks/auth_thunks/signOutThunk';
import {history} from '../Auth/Auth_index';
import EditCommunityModal from './App_EditCommunityModal';
import updateCommunity from '../../thunks/community_thunks/updateCommunityThunk';
import axios from 'axios';
import URL from '../../info';

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isEdited,
      pos: 1,
      admin: false
    };
  }

  componentDidMount() {
    this.navBarChoice();
  }

  handleClick(num) {
    this.setState({tab: num});
  }

  handleLogout() {
    this.props.onLogout(history);
  }

  navBarChoice() {
    console.log('this is the window loc', window.location.href.split('/')[window.location.href.split('/').length - 1] );
    if (window.location.href.split('/')[window.location.href.split('/').length - 1] === 'discover') {
      this.setState({ pos: 1 });
    } else if (window.location.href.split('/')[window.location.href.split('/').length - 1] === 'directory') {
      this.setState({ pos: 2 });
    } else if (window.location.href.split('/')[window.location.href.split('/').length - 1] === 'map') {
      this.setState({ pos: 3 });
    } else {
      this.setState({ pos: 0 });
    }
  }

  navBarChoiceArt(pos) {
    this.setState({pos: pos});
  }

  handleLogoClick() {
    if (this.props.community.admins.filter((user) => (user._id === this.props.user)).length > 0) {
      this.setState({admin: !this.state.admin});
    }
  }

  handleClose() {
    this.setState({admin: false});
  }

  handleSubmit(image, titleValue, oldT, newT, admins) {
    axios.post(URL + 'db/update/community', {
      title: titleValue,
      image: image,
      oldFilters: oldT,
      newFilters: newT,
      admins: admins
    })
    .then(() => {
      window.location.reload();
    });
  }

  render() {
    let title;
    if (this.props.community) {
      title = this.props.community.title ? this.props.community.title.split(' ').join('') : 'bet';
    } else {
      title = 'missing';
    }
    return (
          <div className="row" id="navBar">
              <Link className="navBarHome" to={'/walnuthome'} onClick={() => {
                this.handleClick(1);
                this.setState({isOpen: true});
                this.props.clearDirectory();
              }}>
                <Icon name="home" size="big" />
              </Link>
              <div className="communityNavBarLogo">
                <div className="imageWrapperCommunity">
                  <img className="communityImage" src={this.props.community.icon} onClick={() => this.handleLogoClick()} />
                </div>
                <h3 className="communityTitle" onClick={() => this.handleLogoClick()}>{this.props.community.title}</h3>
              </div>

              <div className="navBarLinks">
                <div className="navBarLink" onClick={() => { this.handleClick(1); this.setState({ isOpen: true }); this.navBarChoiceArt(1);}}>
                  <Link className="tabs" to={'/community/' + title + '/discover'}>
                    <p className={(this.state.pos === 1) ? 'navbarLinkOn' : 'navbarLinkOff' }>Discover</p>
                    {this.state.pos === 1 ? <div className="bottomBar"></div> : null}
                  </Link>
                </div>
                <div className="navBarLink" onClick={() => { this.handleClick(2); this.setState({ isOpen: true }); this.navBarChoiceArt(2);}}>
                  <Link className="tabs" to={'/community/' + title + '/directory'}>
                    <p className={(this.state.pos === 2) ? 'navbarLinkOn' : 'navbarLinkOff'}>Directory</p>
                    {this.state.pos === 2 ? <div className="bottomBar"></div> : null}
                  </Link>
                </div>
                <div className="navBarLink" onClick={() => { this.handleClick(3); this.setState({ isOpen: true }); this.navBarChoiceArt(3);}}>
                  <Link className="tabs" to={'/community/' + title + '/map'}>
                    <p className={(this.state.pos === 3) ? 'navbarLinkOn' : 'navbarLinkOff'}>Map</p>
                    {this.state.pos === 3 ? <div className="bottomBar"></div> : null}
                  </Link>
                </div>

                {/* <div className="navBarLink" onClick={() => this.handleClick(4)}>
                  <Link className="tabs" to={'/community/' + title + '/editprofile'}>
                    <Icon className="navBarIcon" name="paypal" size="big"/>
                  </Link>
                  {(this.props.tab === 4) ?
                    <div className="bar">
                      </div> : null
                    }
                </div> */}
              </div>

            <div className="navBarLinksRight">
              <div className="imageWrapperNav">
                <img className="postUserImage" src={this.props.pictureURL} />
                {/* {!(this.state.isOpen || this.props.isEdited) ?*/}
                  {/* <div className="profilePopoutOuterMost" onClick={() => this.setState({isOpen: true})}>*/}
                    {/* <div className="profilePopoutOuter">*/}
                      {/* <div className="arrow-up"></div>*/}
                      {/* <Link className="profilePopeoutHeaderTab" onClick={() => this.setState({isOpen: true})} to={'/community/' + title + '/editprofile'}>*/}
                        {/* <h2 className="profilePopeoutHeader">Complete the profile</h2>*/}
                      {/* </Link>*/}
                    {/* </div>*/}
                  {/* </div> : null}*/}
              </div>
              <Dropdown className="profileDropdown link item" text={this.props.fullName.split(' ')[0]} pointing>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <Link className="dropdownProfileLink"
                          to={'/community/' + title + '/editprofile'}
                          onClick={() => this.setState({pos: 0})} >
                    Edit Profile
                    </Link>
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item className="dropdownLogout" onClick={() => this.handleLogout()}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              {/* <a className="logoutText" href="/logout">
              <Icon name="log out" className="logoutIcon" size="big"/>
                Logout</a> */}
            </div>
            {this.state.admin ?
              <EditCommunityModal
                handleUpdate={(image, titleValue, oldT, newT, admins) => this.handleSubmit(image, titleValue, oldT, newT, admins)}
                handleLogoClose={() => this.handleClose()}
                community={this.props.community}
                /> :
              null
            }
        </div>
        );
  }
}


Navbar.propTypes = {
  pictureURL: PropTypes.string,
  community: PropTypes.object,
  changeTab: PropTypes.func,
  isEdited: PropTypes.bool,
  fullName: PropTypes.string,
  onLogout: PropTypes.func,
  history: PropTypes.object,
  user: PropTypes.string,
  updateCommunity: PropTypes.func,
  clearDirectory: PropTypes.func
};

const mapStateToProps = (state) => ({
  pictureURL: state.userReducer.pictureURL,
  fullName: state.userReducer.fullName,
  user: state.userReducer._id,
  community: state.userReducer.currentCommunity,
  isEdited: state.userReducer.isEdited
});

const mapDispatchToProps = (dispatch) => ({
  changeTab: (tab) => dispatch({type: 'CHANGE_NAVBAR_TAB', tab: tab}),
  onLogout: (his) => dispatch(signOutThunk(his)),
  updateCommunity: (img, title, oldT, newT, admins) => dispatch(updateCommunity(img, title, oldT, newT, admins)),
  clearDirectory: () => dispatch({type: 'DIRECTORY_FRESH'})
});


export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
