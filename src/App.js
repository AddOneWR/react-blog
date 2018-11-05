import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

// import Nav from './component/Nav/Nav';
// import Index from './container/Index';
// import Category from './container/Category/Category';
// import List from './container/List/List';
import Detail from './container/Detail/Detail';
import NotFound from './container/NotFound/NotFound';
// import About from './container/AboutMe/AboutMe';
import MacIndex from './container/MacIndex/MacIndex';
import MacMask from './container/MacMask/MacMask';

import './App.css';

class App extends Component {
  render() {
    return (
      <div className="app-container">
        {/* <Nav/> */}
        <Switch>
          <Route exact path='/' component={MacMask} />
          {/* <Route exact path='/category' component={Category} /> */}
          {/* <Route exact path='/list' component={List} /> */}
          <Route exact path='/detail' component={Detail} />
          {/* <Route exact path='/about' component={About} /> */}
          <Route exact path='/mac' component={MacIndex} />
          {/* <Route exact path='/mask' component={MacMask} /> */}
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

export default App;
