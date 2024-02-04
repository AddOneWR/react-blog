import React from 'react';

import './macbottom.less';

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
      <a href="https://imgchr.com/1232235472" target="_blank" rel="noopener noreferrer nofollow">
        <img src='https://s2.ax1x.com/2019/01/02/FImOiR.png' className="icon" alt="icon"></img>    
      </a>
      <img src='https://s1.ax1x.com/2018/11/21/F9hlgx.png' className="icon" alt="icon" onClick={props.handleSearch}></img>
      {
        props.tempFileList &&
          props.tempFileList.map((item, index) => 
            <div 
              className="mac-bottom-temp" 
              key={index}
              onClick={() => props.onFileOpen(item.category, item.name)}
            >
              <img src="https://s2.ax1x.com/2019/01/03/FoNHhV.png" className="icon" alt="icon" />
              <span>{item.name}</span>
            </div>
          )
      }
    </div>
  </div>
)

export default MacBottom;
