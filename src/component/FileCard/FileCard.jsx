import React from 'react';

import './filecard.scss';

const renderNoLink = (props) => (
  <div className='file-card-item' onClick={props.onClick}>
    <img src='https://s1.ax1x.com/2018/11/21/F9fOjf.png' className='file-card-img file-card-img-macfile' alt="macFile"></img>
    <span className="file-card-name">{props.name || '无名氏'}</span>
  </div>
)

const renderLink = (props) => (
  <div 
    className={`file-card-item ${props.class}`} 
    onClick={props.onFileOpen.bind(null, props.category, props.name)}
  >
    <img 
      src={props.imgSrc ? props.imgSrc : 'http://p5sf6v0wz.bkt.clouddn.com/mac-md.png'} 
      className={`file-card-img ${props.class}`} 
      alt="macFile">
    </img>
    <span className="file-card-name">{props.name || '无名氏'}</span>
  </div>
)

const FileCard = (props) => (
  props.category ? 
  renderLink(props) :
  renderNoLink(props)
)

export default FileCard;
