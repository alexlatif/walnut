
import React from 'react';
import PropTypes from 'prop-types';
import './App.css';
import { Card, Button, Icon, Image } from 'semantic-ui-react';


class CommunityCard extends React.Component {

  render() {
    if (this.props.joined) {
      return (
          <Card className="communityCard">
              <Image className="communityCardImage" src={this.props.icon} />
              <Card.Content className="communityCardContent">
                  <Card.Header className="communityHeader">
                      {this.props.title}
                  </Card.Header>
              </Card.Content>
          </Card>
      );
    }
    return (
      <Card className="communityCard">
          <Image className="communityCardImage" src={this.props.icon} />
          <Card.Content className="communityCardContent">
              <Card.Header className="communityHeader">
                  {this.props.title}
              </Card.Header>
          </Card.Content>
          <Card.Content extra>
              {this.props.title === 'Test Squad' ?
                    <Button className="joinButton" onClick={() => this.props.join(this.props.communityId)} content="Join" icon="plus" labelPosition="left" />
                        : null}
          </Card.Content>
      </Card>
    );
  }
}


CommunityCard.propTypes = {
  joined: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.string,
  join: PropTypes.func,
  communityId: PropTypes.string
};


export default CommunityCard;
