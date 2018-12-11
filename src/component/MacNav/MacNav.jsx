import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import cn from 'astro-classname';

import friends from '../../constant/friends';
import './macnav.scss';

class MacNav extends Component {
  state = {
    isLinkOpen: false,
    isProOpen: false
  }

  openLinkList = () => {
    this.setState({
      isLinkOpen: !this.state.isLinkOpen
    })
  }

  openProList = () => {
    this.setState({
      isProOpen: !this.state.isProOpen
    })
  }

  render() {
    const { isLinkOpen, isProOpen } = this.state;
    return (
      <div className="macnav-container">
        <div className="macnav-main">
          <Link to='/'>
            <img src='https://s1.ax1x.com/2018/12/11/FY3v5V.png' alt="mac" className="macnav-icon"></img>
          </Link>
          <div className="macnav-name">AddOneG</div>
          <div className="macnav-link" onClick={this.openLinkList}>友情链接</div>
          <div className="macnav-link" onClick={this.openProList}>小小实验室</div>
          <ul 
            className={cn('macnav-linkList macnav-hideList', {
              'macnav-open': isLinkOpen
            })}
          >
            {
              friends.map((item, index) => (
                <li key={index}>
                  <a 
                    href={item.link} 
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                  >
                    {item.name}
                  </a>
                </li>
              ))
            }
          </ul>
          <ul 
            className={cn('macnav-proList macnav-hideList', {
              'macnav-open': isProOpen
            })}
          >
            <li><a href="http://www.addoneg.com/js2c/index.html" target="_blank"  rel="noopener noreferrer nofollow">C语言转JS超微型编译器</a></li>
            <li><a href="http://www.addoneg.com/exp2nfa/index.html" target="_blank"  rel="noopener noreferrer nofollow">正规式 ←→ NFA</a></li>
            <li><a href="http://www.addoneg.com/gifmake/index.html" target="_blank"  rel="noopener noreferrer nofollow">在线GIF图制作~</a></li>
          </ul>
        </div>
      </div>
    )
  }
}

export default MacNav;
