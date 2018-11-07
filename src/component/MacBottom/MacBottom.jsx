import React from 'react';

import './macbottom.scss';

const MacBottom = (props) => (
  <div className="mac-bottom-container">
    <a href="https://github.com/AddOneDn" target="_blank" rel="noopener noreferrer nofollow">
      <img src='http://p5sf6v0wz.bkt.clouddn.com/mac-github.png' className="icon" alt="icon"></img>
    </a>
    <a href="https://www.npmjs.com/~xujiayihaoren1" target="_blank" rel="noopener noreferrer nofollow">
      <img src='http://p5sf6v0wz.bkt.clouddn.com/mac-npm.png' className="icon" alt="icon"></img>    
    </a>
    <a href="https://juejin.im/user/5800c5b267f3560058a9f89f" target="_blank" rel="noopener noreferrer nofollow">
      <img src='http://p5sf6v0wz.bkt.clouddn.com/mac-jj.png' className="icon" alt="icon"></img>    
    </a>
    <img src='http://p5sf6v0wz.bkt.clouddn.com/blog-mac-search.png' className="icon" alt="icon" onClick={props.handleSearch}></img>
  </div>
)

export default MacBottom;
