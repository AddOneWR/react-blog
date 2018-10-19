import React, { Component } from 'react';
import cn from 'astro-classname';
import { Link } from 'react-router-dom';

import './nav.scss';

class Nav extends Component {
  state = {
    isClose: true,
    value: ''
  }
  
  toggleClass = () => {
    this.setState({
      value: !this.state.isClose ? '' : this.state.value,
      isClose: !this.state.isClose
    });
  }

  inputChange = (e) => {
    this.setState({
      value: e.target.value
    });
  }

  onKeyup = (e) => {
    if(e.keyCode === 13) {
      console.log(this.state.value)
    }
  }

  render() {
    const { isClose, value } = this.state;
    return (
      <div className='nav-container'>
        <Link to='/' className="nav-name_left"><div className="nav-name">Home</div></Link>
        <div className={cn('nav-input-wrapper',{
          open: !isClose
        })}>
          <input type="text" name="input" 
            className={cn('input',{
              square: !isClose
            })} 
            value={value}
            onChange={this.inputChange}
            onKeyUp={this.onKeyup}
          />
          <button className={cn('search',{
            close: !isClose
          })} onClick={this.toggleClass}></button>
        </div>
        <Link to='/category' className="nav-name_right">
          <div className="nav-name">Category</div>
        </Link>
      </div>
    )
  }
}

export default Nav;