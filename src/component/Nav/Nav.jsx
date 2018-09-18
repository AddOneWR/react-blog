import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './nav.scss';

class Nav extends Component {
  render() {
    return (
      <div className="nav-container">
        <Link to='/' className="nav-name_left"><div className="nav-name">AddOneG</div></Link>
        <Link to='/category' className="nav-name_right"><div className="nav-name">Category</div></Link>
      </div>
    )
  }
}

export default Nav;