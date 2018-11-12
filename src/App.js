import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import NotFound from './container/NotFound/NotFound';
import MacIndex from './container/MacIndex/MacIndex';
import MacMask from './container/MacMask/MacMask';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app-container">
        <Switch>
          <Route exact path='/' component={MacMask} />
          <Route exact path='/mac' component={MacIndex} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

export default App;
