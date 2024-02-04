import React from 'react';

import './filecard.less';

const renderNoLink = (props) => (
  <div className='file-card-item' onClick={props.onClick}>
    <img src='https://s1.ax1x.com/2018/12/11/FY8V56.png' className='file-card-img' alt="macFile"></img>
    <span className="file-card-name">{props.name || '无名氏'}</span>
  </div>
)

const renderLink = (props) => (
  <div 
    className={`file-card-item ${props.class}`} 
    onClick={props.onFileOpen.bind(null, props.category, props.name)}
  >
    <img 
      src={props.imgSrc ? props.imgSrc : 'https://s2.ax1x.com/2019/01/03/FoNXX4.png'} 
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
