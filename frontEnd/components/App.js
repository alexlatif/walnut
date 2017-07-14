import React from 'react';
import {Route, Link} from 'react-router-dom';
import NavBar from '../containers/NavBar';
import Home from './Home';

// TODO need to implement routes and links from navbar to render the underneath
// TODO and also setting /home as default

class App extends React.Component {

  render() {
    return (
      <div>
        <NavBar />
        <Home />
      </div>
    );
  }
}

export default App;
