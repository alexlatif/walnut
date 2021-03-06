// dispatches filter preferences

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select  from 'react-select';
import { Icon, Button, Label } from 'semantic-ui-react';
import newTagThunk from '../../thunks/post_thunks/newTagThunk';

// TODO Filter component box style
// TODO button onClick dispatches toggleChecked(index) 17

class TagPref extends React.Component {
  constructor() {
    super();
    this.state = {
      value: []
    };
  }

  handleSelectChange(obj) {
    // if (value.trim().length > 0) {
    this.setState({obj});
    if (obj) {
      const options = obj.value.replace(/\W/g, '');
      const send = this.props.otherFilters.filter((filter) => options === filter.name);
      if (send.length === 0) {
        this.props.addNewTags(options);
      } else {
        this.props.addTags(send);
      }
      // this.props.addTags(send);
      this.setState({value: []});
    }
  }

  // handleKeyPress(event) {
  //   if(event.key == 'Enter') {
  //     console.log(event);
  //     console.log('clicked');
  //     console.log(this.state.value);
  //   }
  // }

  handleNew(value) {
    event.preventDefault();
    // make sure not to have empty strings
    if (value) {
      const options = this.state.value.map((obj) => {return obj.value.replace(/\W/g, '');});
      // const options = this.state.value.split(',');
      // send is an array that only includes the objects that are being added
      options.forEach((newTag) => {
        const send = this.props.otherFilters.filter((filter) => newTag === filter.name);
        if (send.length === 0) {
          this.props.newTagThunk(newTag);
        } else {
          this.props.addTags(send);
        }
      });
      // this.props.addTags(send);
      this.setState({value: []});
    }
  }

  handleChange(e) {
    this.props.addNewTags(e.target.value);
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div>
        <div className="topics">
        {this.props.tags || this.props.newtags ?
          this.props.tags.concat(this.props.newtags).map((filter, index) => (
              <div key={index} className="tag">
                <text className="hashtag"># {filter.name ? filter.name : filter.toUpperCase()}</text>
                <Icon className="topicRemove" name="delete" onClick={() => this.props.handleRemove(filter)} />
              </div>
              )) :
          null
        }
        </div>
        <div className="topicSelector">
          <p className="addTopics">Add Topic(s):</p>
          <Select.Creatable
              placeholder="Add topic(s)"
              className="searchTags"
              clearable={false}
              value={this.state.value}
              options={this.props.otherFilters.filter((tagger) => {
                let use = true;
                this.props.tags.concat(this.props.newTags).forEach((top) => {
                  if (typeof(top) === 'object') {
                    if (top.name === tagger.name) use = false;
                  }
                  if (top === tagger.name) use = false;
                });
                return use;
              }).map((tag) => {
                return {value: tag.name, label: '#' + tag.name};
              })}
              onChange={(e) => this.handleSelectChange(e)}
          />
        </div>
      </div>
    );
  }
}

TagPref.propTypes = {
  otherTags: PropTypes.array,
  otherFilters: PropTypes.array,
  addTags: PropTypes.func,
  tags: PropTypes.array,
  addTempTags: PropTypes.func,
  tempTags: PropTypes.array,
  newTags: PropTypes.array,
  newTagThunk: PropTypes.func,
  addNewTags: PropTypes.func,
  handleRemove: PropTypes.func,
  newtags: PropTypes.array
};

const mapStateToProps = (state) => ({
  otherFilters: state.discoverReducer.otherFilters,
  newTags: state.newTagsReducer
});

const mapDispatchToProps = (dispatch) => ({
  newTagThunk: (tag) => dispatch(newTagThunk(tag))
});

export default connect(mapStateToProps, mapDispatchToProps)(TagPref);


 // style={{float: 'left', clear: 'both', padding: '5%', paddingTop: '40'}}
