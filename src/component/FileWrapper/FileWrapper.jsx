import React, { Component } from 'react';
import cn from 'astro-classname';

import FileCard from '../FileCard/FileCard';
import FileList from '../FileList/FileList';
import markdownList from '../../constant/markdown';
import './filewrapper.less';

class FileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: '',
      select: 'l'
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

  changeSort(select) {
    this.setState({
      select: select
    })
  }

  render() {
    const { select } = this.state;
    const { category, onClose, classNames, onFileOpen, isSearch } = this.props;
    let mdList = isSearch ? this.renderSearchList() : markdownList[category];
    
    return (
      <div className={`filewrapper-container ${classNames}`}>
        <div className="filewrapper-banner">
          <div className="filewrapper-banner-top">
            <div className="filewrapper-close" onClick={onClose}></div>
            <div className="filewrapper-title">{isSearch ? '搜索结果' : category}</div>
          </div>
          <div className="filewrapper-icon-wrapper">
            <div className="filewrapper-time">{mdList.desc}</div>
            <div 
              className={cn("filewrapper-icon", {
                'w-select': select === 'w',
                'w-noselect': select !== 'w'
              })}
              onClick={() => this.changeSort('w')}
            >
            </div>
            <div 
              className={cn("filewrapper-icon", {
                'l-select': select === 'l',
                'l-noselect': select !== 'l'
              })}
              onClick={() => this.changeSort('l')}
            >
            </div>
          </div>
        </div>
        <div className={cn("filewrapper-markdown-wrapper", {
          'filewrapper-list-wrapper': select === 'l'
        })}>
        {
          mdList && 
            mdList.list.sort(
              (b, a) => Date.parse(a.time) - Date.parse(b.time)
            ).map((item, index) => (
              select === 'w' ?
              <FileCard 
                class="file-card-small" 
                name={item.title} 
                key={index} 
                category={isSearch ? item.category : category}
                onFileOpen={onFileOpen}
              /> : 
              <FileList
                onFileOpen={onFileOpen}
                title={item.title}
                category={isSearch ? item.category : category}
                time={item.time}
                key={index} 
              />
            ))
        }
        </div>
      </div>
    )
  }
  
}

export default FileWrapper;
