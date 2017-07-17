// dispatches filter preferences

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

// TODO Filter component box style
// TODO button onClick dispatches toggleChecked(index) 17

class TagPref extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tagsArray: []
    };
  }

  updateArray(tag) {
    const tagsCopy = this.state.tagsArray;
    tagsCopy.push(tag);
    this.setState({tagsArray: tagsCopy});
    this.props.addTags(tagsCopy);
  }

  handleChange(e) {
    console.log('handleChange working ish', e.target.value);
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div>
        <form name="choice_form" id="choice_form" method="post" onSubmit={this.handleSubmit}>
          {this.props.filters.map((filter) => (
            <div>
              <input type="checkbox" id={filter.name}
                checked="checked"
                value={filter.name}
                onChange={this.handleChange}
                />
              <label htmlFor={filter.name}># {filter.name}</label>
            </div>
            ))}
        </form>
      </div>
    );
  }
}

TagPref.propTypes = {
  filters: PropTypes.array,
  addTags: PropTypes.func
};

const mapStateToProps = (state) => ({
  filters: state.discoverReducer.filters
});

const mapDispatchToProps = () => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(TagPref);


 // style={{float: 'left', clear: 'both', padding: '5%', paddingTop: '40'}}