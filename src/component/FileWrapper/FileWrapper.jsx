import React, { Component } from 'react';

import FileCard from '../FileCard/FileCard';
import markdownList from '../../constant/markdown';
import './filewrapper.scss';

class FileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: ''
    }
  }

  renderSearchList() {
    let searchValue = this.props.searchValue;
    let searchList = {
      desc: '',
      list: []
    };

    Object.keys(markdownList).forEach((key) => {
      markdownList[key].list.forEach((item) => {
        if(item.title.toLowerCase().search(searchValue.toLowerCase()) !== -1) {
          item.category = key;
          searchList.list.push(item);
        }
      })
    })

    searchList.list.sort(
      (b, a) => Date.parse(a.time) - Date.parse(b.time)
    );

    return searchList;
  }

  render() {
    const { category, onClose, classNames, onFileOpen, isSearch } = this.props;
    let mdList = isSearch ? this.renderSearchList() : markdownList[category];
    return (
      <div className={`filewrapper-container ${classNames}`}>
        <div className="filewrapper-banner">
          <div className="filewrapper-banner-top">
            <div className="filewrapper-close" onClick={onClose}></div>
            <div className="filewrapper-title">{isSearch ? '搜索结果' : category}</div>
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
                category={isSearch ? item.category : category}
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
