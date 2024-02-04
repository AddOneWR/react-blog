import React from 'react';
import { Link } from 'react-router-dom';
import './mask.less';

const MacMask = () => (
  <div className="mask-container">
    <div className="mask-main">
      <img src="https://s1.ax1x.com/2018/12/11/FY32DA.jpg" className="mask-avatar" alt="avatar" width="80" height="80"/>
      <p>AddOne</p>
      <p>前端开发者，Javascript爱好者</p>
      <Link to='/mac'>
        <div className="mask-btn">
          Enter
        </div>
      </Link>
    </div>
  </div>
)

export default MacMask;
