
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import './Directory.css';
import getUsersThunk from '../../thunks/directory_thunks/getUsersThunk';
import DirectoryCard from './Directory_Card';
import Select from 'react-select';
import uuidv4 from 'uuid/v4';

class Directory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCards: [],
      query: ''
    };
  }

  componentWillMount() {
    // TODO pass down users from community reducer and if state hit refresh with last refresh
    // or new last refresh??
    if (this.props.lastRefresh !== '') {
      this.setState({currentCards: this.props.users});
      return;
    }
    this.props.getUsers();
  }

  componentDidMount() {
    const urls = this.props.location.pathname;
    localStorage.setItem('url', urls);
    sessionStorage.setItem('url', urls);
    // testing here:
    // this.setState({currentCards: this.props.users});
  }

  componentWillReceiveProps(nextProps) {
    this.setState({currentCards: nextProps.users});
  }

  handleChange(value) {
    // console.log('it works!', value);
    const substring = (value ? value : '').toLowerCase();
    const filteredCards = this.props.users.filter((user) => {return user.fullName.toLowerCase().includes(substring);});
    this.setState({query: substring});
    this.setState({currentCards: filteredCards});
  }

  render() {
    return (
      <div>
        <div className="directoryCardsList">
              <Select
                  className="search"
                  name="selected-state"
                  value={this.state.query}
                  simpleValue
                  options={this.props.users.map((user) => {
                    return {value: user.fullName, label: user.fullName};
                  })}
                  placeholder="Search by Name..."
                  onInputChange={this.handleChange.bind(this)}
              />
              {this.state.currentCards.map(user =>
              <DirectoryCard
                key={uuidv4()}
                picture={user.pictureURL}
                name={user.fullName}
                email={user.contact.email[0]}
                school={user.education.colleges[0]}
                job={user.work[0]}
              />
              )}
        </div>
      </div>
    );
  }
}


Directory.propTypes = {
  getUsers: PropTypes.func,
  users: PropTypes.array,
  location: PropTypes.object,
  lastRefresh: PropTypes.string
};

const mapStateToProps = (state) => ({
  users: state.directoryReducer.users,
  lastRefresh: state.directoryReducer.lastRefresh
});

const mapDispatchToProps = (dispatch) => ({
  getUsers: () => dispatch(getUsersThunk())
});

export default connect(mapStateToProps, mapDispatchToProps)(Directory);
