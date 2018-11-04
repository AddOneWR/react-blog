import React from 'react';

import './macbottom.scss';

const MacBottom = () => (
  <div className="mac-bottom-container">
    <a href="https://github.com/AddOneDn" target="_blank" rel="noopener noreferrer nofollow">
      <img src={require('../../static/mac-github.png')} className="icon" alt="icon"></img>    
    </a>
    <a href="https://www.npmjs.com/~xujiayihaoren1" target="_blank" rel="noopener noreferrer nofollow">
      <img src={require('../../static/mac-npm.png')} className="icon" alt="icon"></img>    
    </a>
    <a href="https://juejin.im/user/5800c5b267f3560058a9f89f" target="_blank" rel="noopener noreferrer nofollow">
      <img src={require('../../static/mac-jj.png')} className="icon" alt="icon"></img>    
    </a>
  </div>
)

export default MacBottom;