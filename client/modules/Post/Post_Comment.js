import React from 'react';
import PropTypes from 'prop-types';
import { Card, Popup } from 'semantic-ui-react';
import './Post.css';
import firebaseApp from '../../firebase';
import Linkify from 'linkifyjs/react';
import LinkPreviewComment from './LinkPreviewComment';

const dateStuff = {
  months: {
    Jan: 'January',
    Feb: 'February',
    Mar: 'March',
    Apr: 'April',
    May: 'May',
    Jun: 'June',
    Jul: 'July',
    Aug: 'August',
    Sep: 'September',
    Oct: 'October',
    Nov: 'November',
    Dec: 'December'
  },
  days: {
    '01': '1st',
    '02': '2nd',
    '03': '3rd',
    '04': '4th',
    '05': '5th',
    '06': '6th',
    '07': '7th',
    '08': '8th',
    '09': '9th',
    '10': '10th',
    '11': '11th',
    '12': '12th',
    '13': '13th',
    '14': '14th',
    '15': '15th',
    '16': '16th',
    '17': '17th',
    '18': '18th',
    '19': '19th',
    '20': '20th',
    '21': '21st',
    '22': '22nd',
    '23': '23rd',
    '24': '24th',
    '25': '25th',
    '26': '26th',
    '27': '27th',
    '28': '28th',
    '29': '29th',
    '30': '30th',
    '31': '31st',
  }

};

const defaults = {
  attributes: null,
  className: 'linkified',
  defaultProtocol: 'http',
  events: null,
  format: (value) => {
    return value;
  },
  formatHref: (href) => {
    return href;
  },
  ignoreTags: [],
  nl2br: false,
  tagName: 'a',
  target: {
    url: '_blank'
  },
  validate: true
};

class Comment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      useDate: '',
      urls: [],
      messageBody: ''
    };
  }

  componentWillMount() {
    this.setState({ useDate: this.getUseDate(this.props.createdAt) });
    const urls = this.urlFinder(this.props.content);
    this.setState({ urls: urls });
    if (urls.length === 0) {
      const idx = this.props.content.indexOf(urls[0]);
      const newBody = this.props.content.substr(idx, 1);
      if(newBody.length < 1) {
        this.setState({ messageBody: this.props.content });
      } else {
        this.setState({ messageBody: newBody });
      }
    } else {
      this.setState({messageBody: this.props.content});
    }
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
  }


  render() {
    console.log('this is re rendering');
    const urlPrev = this.state.urls.length > 0 ? this.state.urls.map((url) => <LinkPreviewComment url={url} />) : [];
    const useDate = this.getUseDate(this.props.createdAt);
    if (this.props.authorId === firebaseApp.auth().currentUser.uid) {
      return (
        <Popup
        trigger={<div className="messageGroupYou" id={this.props.id}>
          {/* <div className="messageNameYou">{this.props.name.split(' ')[0]}</div>*/}
          <div className="userGroupYou">
            <Card className="commentCardYou">
              <Card.Content className="messageContent">
                <Card.Description className="messageDescription" style={{color: '#fff'}}>
                  <Linkify tagName="p" options={defaults}>{this.state.messageBody}</Linkify>
                </Card.Description>
                {urlPrev.length > 0 ? urlPrev[0] : null}
              </Card.Content>
            </Card>
          </div>
        </div>}
        content={this.state.useDate}
        position="right center"
        inverted />
      );
    }
    return (
      <div className="userGroupOther">
        <Popup
        trigger= {<div className="imageWrapper messageAvatarOther">
          <img className="postUserImage" src={this.props.authorPhoto} />
        </div>}
        content={this.props.name}
        position="left center"
        inverted
        />
        <Popup
        trigger = {<div className="messageGroupOther" id={this.props.id}>
          <div className="messageNameOther">{this.props.name ? this.props.name.split(' ')[0] : ''}</div>
            <Card className="commentCardOther">
              <Card.Content className="messageContent">
                <Card.Description className="messageDescription" style={{color: '#fff'}}>
                    {this.props.content}
                </Card.Description>
              </Card.Content>
            </Card>
          </div>}
        content={this.state.useDate}
        position="left center"
        inverted />
      </div>
    );
  }
}

Comment.propTypes = {
  postData: PropTypes.object,
  name: PropTypes.string,
  createdAt: PropTypes.string,
  content: PropTypes.string,
  currentUser: PropTypes.object,
  authorId: PropTypes.string,
  authorPhoto: PropTypes.string,
  id: PropTypes.string,
};

export default Comment;
