import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TopicSelector from './Discover_TopicSelector';
import Online from './Discover_Online';

import './Discover.css';
class LeftSideBar extends React.Component {
  constructor() {
    super();
    this.state = {
    };
  }

  filterChange(filterName) {
    const filts = this.props.filters;
    if (filts.indexOf(filterName) >= 0) {
      const idx = filts.indexOf(filterName);
      filts.splice(idx, 1);
    } else {
      filts.push(filterName);
    }
    this.props.changeFilters(filts);
  }

  render() {
    return (
      <div className="LeftSidebar_Container">
        <div className="LeftSideBar_Preference">
          <div>
             <TopicSelector filterChange={(name) => (this.filterChange(name))}/>
          </div>
        </div>
        {/* <Online />*/}
      </div>
    );
  }
}

LeftSideBar.propTypes = {
  community: PropTypes.object,
  filters: PropTypes.array,
  changeFilters: PropTypes.func
};

const mapStateToProps = (state) => ({
  filters: state.discoverReducer.filters,
  community: state.userReducer.currentCommunity
});

const mapDispatchToProps = (dispatch) => ({
  changeFilters: (filts) => {
    dispatch({type: 'CHANGE_FILTERS', filters: filts});
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(LeftSideBar);


