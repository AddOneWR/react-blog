import React from 'react';

import './macbottom.scss';

const MacBottom = (props) => (
  <div className="mac-bottom-container">
    <div className="mac-bottom-main">
      <a href="https://github.com/AddOneDn" target="_blank" rel="noopener noreferrer nofollow">
        <img src='https://s1.ax1x.com/2018/11/21/F9hMCR.png' className="icon" alt="icon"></img>
      </a>
      <a href="https://www.npmjs.com/~xujiayihaoren1" target="_blank" rel="noopener noreferrer nofollow">
        <img src='https://s1.ax1x.com/2018/11/21/F9hmE4.png' className="icon" alt="icon"></img>    
      </a>
      <a href="https://juejin.im/user/5800c5b267f3560058a9f89f" target="_blank" rel="noopener noreferrer nofollow">
        <img src='https://s1.ax1x.com/2018/11/21/F9hZbF.png' className="icon" alt="icon"></img>    
      </a>
      <img src='https://s1.ax1x.com/2018/11/21/F9hlgx.png' className="icon" alt="icon" onClick={props.handleSearch}></img>
    </div>
  </div>
)

export default MacBottom;
