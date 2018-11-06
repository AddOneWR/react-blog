import React, { Component } from 'react';

import FileCard from '../FileCard/FileCard';
import markdownList from '../../constant/markdown';
import './filewrapper.scss';

class FileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentDidMount() {
    
  }

  render() {
    const { category, onClose, classNames, onFileOpen } = this.props;
    const mdList = markdownList[category];
    return (
      <div className={`filewrapper-container ${classNames}`}>
        <div className="filewrapper-banner">
          <div className="filewrapper-banner-top">
            <div className="filewrapper-close" onClick={onClose}></div>
            <div className="filewrapper-title">{category}</div>
          </div>
          <div className="filewrapper-banner-bottom">{mdList.desc}</div>
        </div>
        <div className="filewrapper-card-wrapper">
        {
          mdList && 
            mdList.list.sort(
              (b, a) => Date.parse(a.time) - Date.parse(b.time)
            ).map((item, index) => (
              <FileCard 
                class="file-card-small" 
                name={item.title} 
                key={index} 
                category={category}
                onFileOpen={onFileOpen}
              />
            ))
        }
        </div>
      </div>
    )
  }
  
}

export default FileWrapper;
