import React from 'react';
import { connect } from 'react-redux';
import { Form, Message, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import emailRegistrationThunk from '../../thunks/auth_thunks/emailRegistrationThunk';
import './Auth.css';


class Register extends React.Component {
  constructor() {
    super();
    this.state = {
      fName: '',
      lName: '',
      email: '',
      password: '',
      repeat: '',
      failed: false,
      passwordFail: false,
      passwordShort: false
    };
  }

  handleFnameChange(e) {
    this.setState({ fName: e.target.value });
  }

  handleLnameChange(e) {
    this.setState({ lName: e.target.value });
  }

  handleEmailChange(e) {
    this.setState({ email: e.target.value });
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
  }

  handleRepeatChange(e) {
    this.setState({ repeat: e.target.value });
  }

  register(e) {
    e.preventDefault();
    if (this.state.password !== this.state.repeat) {
      this.setState({ passwordFail: true });
    }
    if (this.state.password.length < 6) {
      this.setState({ passwordShort: true });
    }
    if (this.state.fName && this.state.lName && this.state.email && this.state.password === this.state.repeat) {
      this.props.emailRegistration(this.state.fName, this.state.lName, this.state.email, this.state.password);
    }
  }

  render() {
    return (
      <div className="registerCard">
        {this.state.passwordShort ?
          <Message icon>
            <Icon name="warning sign" />
            <Message.Content>
              <Message.Header>Passwords must be atleast 6 characters</Message.Header>
            </Message.Content>
          </Message> :
          null
        }
        {this.state.passwordFail ?
          <Message icon>
            <Icon name="warning sign" />
            <Message.Content>
              <Message.Header>Passwords don't match </Message.Header>
            </Message.Content>
          </Message> :
          null
        }
        <Form>
          <Form.Field>
            <label className="authLabelsRegister" htmlFor="fname">First Name</label>
            <input
              type="text"
              name="fname"
              value={this.state.fName}
              onChange={(e) => this.handleFnameChange(e)} />
          </Form.Field>
          <Form.Field>
            <label className="authLabelsRegister" htmlFor="lname">Last Name</label>
            <input
              type="text"
              name="lname"
              value={this.state.lName}
              onChange={(e) => this.handleLnameChange(e)} />
          </Form.Field>
          <Form.Field>
            <label className="authLabelsRegister" htmlFor="email">Email</label>
            <input
              type="text"
              name="email"
              value={this.state.email}
              onChange={(e) => this.handleEmailChange(e)} />
          </Form.Field>
          <Form.Field>
            <label className="authLabelsRegister" htmlFor="password">Password</label>
            <input className="form-control"
              type="password"
              name="password"
              value={this.state.password}
              onChange={(e) => this.handlePasswordChange(e)} />
          </Form.Field>
          <Form.Field>
            <label className="authLabelsRegister" htmlFor="passwordRepeat">Confirm Password</label>
            <input
              type="password"
              name="passwordRepeat"
              value={this.state.repeat}
              onChange={(e) => this.handleRepeatChange(e)} />
          </Form.Field>
          <div className="registerButton" onClick={(e) => { this.register(e); }}>Register</div>
        </Form>
      </div>
    );
  }
}

Register.propTypes = {
  emailRegistration: PropTypes.func,
  isVerified: PropTypes.bool
};

const mapStateToProps = (state) => ({
  isVerified: state.userReducer.isVerified
});

const mapDispatchToProps = (dispatch) => ({
  emailRegistration: (firstname, lastname, email, password) => emailRegistrationThunk(firstname, lastname, email, password)(dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Register);
