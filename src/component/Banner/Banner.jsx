import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Motion, spring } from 'react-motion';

import './banner.scss';

class Banner extends Component {
  render() {
    return (
      <div className="banner-container">
        <Motion defaultStyle={{x: 5000}} style={{x: spring(0)}}>
          {interpolatingStyle => (
            <div className="banner-top" style={{transform: `translateX(${interpolatingStyle.x}px)`}}>
              <img src="http://p5sf6v0wz.bkt.clouddn.com/avatar.jpg" className="banner-top_avatar" alt="avatar"/>
            </div>
          )}
        </Motion>
        <Motion defaultStyle={{x: 5000}} style={{x: spring(0)}}>
          {interpolatingStyle => (
            <div className="banner-bottom" style={{transform: `translateX(-${interpolatingStyle.x}px)`}}>
              <div className="banner-bottom_name">AddOneG</div>
              <div className="banner-bottom_desc">心似双丝网，中有千千结</div>
              <div className="banner-bottom_link">
                <a href="https://github.com/AddOneDn" target="_blank" rel="noopener noreferrer nofollow" className="item">Github</a>
                <a href="https://juejin.im/user/5800c5b267f3560058a9f89f" target="_blank"  rel="noopener noreferrer nofollow" className="item">掘金</a>
                <a href="https://www.npmjs.com/~xujiayihaoren1" target="_blank" rel="noopener noreferrer nofollow" className="item">NPM</a>
              </div>
              <Motion defaultStyle={{r: 720*12}} style={{r: spring(0)}}>
              {
                interpolatingStyle => (
                  <Link to='/category'>
                    <div
                      className="banner-bottom_btn" 
                      style={{transform: `rotate(${interpolatingStyle.r}deg)`}}
                    >
                      Enter
                    </div>
                  </Link>
                )
              }
              </Motion>
            </div>
          )}
        </Motion>
      </div>
    )
  }
}

export default Banner;