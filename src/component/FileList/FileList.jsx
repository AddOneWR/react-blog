import React from 'react';

import './filelist.scss';

const FileList = (props) => (
  <div 
    className="filelist-item" 
    onClick={props.onFileOpen.bind(null, props.category, props.title)}
  >
    <div className="filelist-item-title">{props.title || '无名氏'}</div>
    <div className="filelist-item-time">{props.time}</div>
  </div>
)

export default FileList;
