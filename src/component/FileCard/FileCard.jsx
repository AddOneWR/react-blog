import React from 'react';

import './filecard.scss';

const renderNoLink = (props) => (
  <div className='file-card-item' onClick={props.onClick}>
    <img src='http://p5sf6v0wz.bkt.clouddn.com/file_120x120.png' className='file-card-img' alt="macFile"></img>
    <span className="file-card-name">{props.name || '无名氏'}</span>
  </div>
)

const renderLink = (props) => (
  <a href={`/detail?category=${props.category}&name=${props.name}`} target="_blank" rel="noopener noreferrer nofollow">
    <div className={`file-card-item ${props.class}`}>
      <img src='http://p5sf6v0wz.bkt.clouddn.com/mac-md.png' className={`file-card-img ${props.class}`} alt="macFile"></img>
      <span className="file-card-name">{props.name || '无名氏'}</span>
    </div>
  </a>
)

const FileCard = (props) => (
  props.category ? 
  renderLink(props) :
  renderNoLink(props)
)

export default FileCard;
