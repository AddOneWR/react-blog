import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Nav from './component/Nav/Nav';
import Index from './container/Index';
import Category from './container/Category/Category';
import List from './container/List/List';
import Detail from './container/Detail/Detail';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app-container">
        <Nav />
        <Switch>
          <Route exact path='/' component={Index}/>
          <Route exact path='/category' component={Category}/>
          <Route exact path='/list' component={List}/>
          <Route exact path='/detail' component={Detail}/>
        </Switch>
      </div>
    );
  }
}

export default App;
