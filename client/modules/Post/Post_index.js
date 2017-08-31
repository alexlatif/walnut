import React from 'react';
import PropTypes from 'prop-types';
import ModalContainer from './Post_Modal_Container';
import MediaAttachment from './Post_Media_Attachment.js';
import LinkPreview from './LinkPreview';
import './Post.css';
import Lightbox from 'react-images';
import Linkify from 'linkifyjs/react';
import {Divider} from 'semantic-ui-react';

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



class Post extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nested: this.props.nested,
      likeCount: this.props.postData.likes.length,
      isLiked: this.props.postData.likes.indexOf(this.props.currentUser._id) > 0,
      lightBoxData: '',
      pdfModalData: '',
      page: 1,
      pages: 100,
      urls: []
    };
  }
  componentWillMount() {
    const urls = this.urlFinder(this.props.postData.content);
    this.setState({urls: urls});
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

  handleClick() {
    this.setState({isOpen: !this.state.isOpen});
  }

  toggleLike() {
    this.props.newLike();
    if (this.state.isLiked) {
      this.setState({likeCount: this.state.likeCount - 1, isLiked: false});
    } else {
      this.setState({likeCount: this.state.likeCount + 1, isLiked: true});
    }
  }

  renderLightBox(data) {
    this.setState({lightBoxData: data});
  }

  closeLightbox() {
    this.setState({lightBoxData: ''});
    console.log('this is closed', this.state.lightBoxData);
  }

  renderPdfModal(data) {
    this.setState({pdfModalData: data});
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

  render() {
    const urlPrev = this.state.urls.length > 0 ? this.state.urls.map((url) => <LinkPreview url={url} />) : [];
    return (
      <div className="postOuter">
      <div className="postContent">
        <div className="postUser">
          <div className="imageWrapperPost">
              <img className="postUserImage" src={this.props.postData.pictureURL} />
          </div>
          <div className="postHeader">
            <h3 className="postHeaderUser">{this.props.postData.username}</h3>
          </div>
        </div>
        <div className="postDescription">
          <div className="postInnerContent">
            <Linkify tagName="p" options={defaults}>{this.props.postData.content}</Linkify>
          </div>
        </div>

        {urlPrev.length > 0 ? urlPrev[0] : null}

        {(this.props.postData.attachment.name !== '') ?
        <MediaAttachment data={this.props.postData.attachment}
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

      <Divider className="postDivider" fitted />
      <div className="postFootnote">
        <div className="tagContainer">
          {this.props.postData.tags.map((tag, index) => (
          <div key={index} className="tag">
            <text className="hashtag">#{tag.name}</text>
          </div>))}
        </div>
        <div></div>
        <ModalContainer postData={this.props.postData} currentUser={this.props.currentUser}/>
      </div>
    </div>
    );
  }
}
Post.propTypes = {
  postData: PropTypes.object,
  newLike: PropTypes.func,
  currentUser: PropTypes.object,
  nested: PropTypes.bool
};
export default Post;
