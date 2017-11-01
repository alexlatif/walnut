import React from 'react';
import PropTypes from 'prop-types';
import LocationSearch from './Map_Location_Search_Container';
import NameSearch from './Map_NameSearch';
import MapCard from './Map_Card';
import { connect } from 'react-redux';
import {Button} from 'semantic-ui-react';
import './Map.css';
class MapFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: 'place'
    };
  }


  render() {
    return (
      <div className="outerfilterall" >
        <Button.Group>
          {this.state.search === 'place' ?
            <Button positive>Place</Button> :
            <Button className="buttonPlaceNegative" onClick={() => this.setState({search: 'place'})}>Place</Button>
          }
          <Button.Or />
          {this.state.search === 'place' ?
            <Button className="buttonPersonNegative" onClick={() => this.setState({search: 'person'})}>Person</Button> :
            <Button positive>Person</Button>
          }
        </Button.Group>
        {this.state.search === 'place' ?
          <div className="filter" >
            <LocationSearch />
          </div> :
          <div className="filter" >
            <NameSearch />
          </div>
        }
        <div id="scrollbar">
          <div className="filterOuter" >
            {this.props.users.filter((item) => {return item.location[this.props.selected].length > 0;}).map((user, index) => (
              <MapCard
                id={user.id}
                key={user.id}
                profileURL={user.pictureURL}
                name={user.fullName}
                year={user.education.classYear}
                college={user.education.colleges[0]}
                career={user.currentOccupation}
                email={user.email}
                location={user.location[this.props.selected]}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

MapFilter.propTypes = {
  changeCenter: PropTypes.func,
  changeZoom: PropTypes.func,
  users: PropTypes.array,
  clicked: PropTypes.string,
  selected: PropTypes.string
};

const mapStateToProps = (state) => ({
  clicked: state.mapReducer.clicked,
  selected: state.mapReducer.selected
});

const mapDispatchToProps = (dispatch) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(MapFilter);
