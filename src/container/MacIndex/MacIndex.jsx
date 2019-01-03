import React, { Component } from 'react';
import cn from 'astro-classname';

import FileCard from '../../component/FileCard/FileCard';
import FileWrapper from '../../component/FileWrapper/FileWrapper';
import MacBottom from '../../component/MacBottom/MacBottom';
import MacNav from '../../component/MacNav/MacNav';
import TyporaWrapper from '../../component/TyporaWrapper/TyporaWrapper';
import MacSearch from '../../component/MacSearch/MacSearch';
import categoryList from '../../constant/category';
import markdown from '../../constant/markdown';
import './macIndex.scss';

class MacIndex extends Component {

  state = {
    category: 'react',
    isOpen: false,
    isMdOpen: false,
    isSearchOpen: false,
    isSearch: false,
    tempFileList: [],
    curMonthList: [],
    name: ''
  }

  componentDidMount() {
    console.log('%cShow Your Code', 'font-size: 50px; background: #222831; color: #fff;padding: 20px 30px');
    this.getRecentMd();
  }

  getRecentMd = () => {
    let curMonthList = [];
    let now = new Date();
    let lastMonth = new Date(now.getTime() - 3 * 24 * 3600 * 1000 * 4);
    let lastMonthStamp = Date.parse(lastMonth);
    Object.keys(markdown).forEach(key => {
      markdown[key].list.forEach(item => {
        if(lastMonthStamp < Date.parse(item.time)){
          curMonthList.push({
            key: key,
            value: item
          })
        }
      })
    })
    this.setState({
      curMonthList: curMonthList
    })
  }

  changeCategory = (category) => {
    if(!this.state.isOpen) this.setState({ isOpen: true })
    this.setState({
      category: category,
      isSearch: false
    })
  }
  
  handleClose = () => {
    this.setState({
      isOpen: false
    })
  }

  handleMdClose = () => {
    this.setState({
      isMdOpen: false
    })
  }

  handleFileOpen = (category, name) => {
    let temp = this.state.tempFileList;
    this.state.tempFileList.forEach((item, index) => {
      if(item.name === name && item.category === category) temp.splice(index, 1);
    })

    this.setState({
      category: category,
      name: name,
      isMdOpen: true,
      tempFileList: temp
    })
  }

  openSearch = () => {
    this.setState({
      isSearchOpen: true
    })
  }

  handleSearchClose = () => {
    this.setState({
      isSearchOpen: false
    })
  }

  onSearch = (value) => {
    this.setState({
      searchValue: value,
      isSearch: true,
      isOpen: true
    })
  }

  saveTempFile = (category, name) => {
    let temp = this.state.tempFileList;
    temp.push({
      category,
      name
    });
    
    this.setState({
      temp: temp,
      isMdOpen: false
    });
  }

  renderRecList = (list) => (
    <div className="rec-container">
    {
      list ?
      list.map((item, index) => (
        <FileCard 
          name={item.value.title}
          class='file-card-rec'
          key={index} 
          category={item.key}
          onFileOpen={this.handleFileOpen}
          imgSrc={'https://s1.ax1x.com/2018/12/11/FY8raq.png'}
        />
      )) :
      '懒惰的博主已经一个多星期没更新了，快去催他'
    }
    </div>
  )

  render() {
    const { category, name, isOpen, isMdOpen, isSearchOpen, searchValue, isSearch, curMonthList, tempFileList } = this.state;
    return (
      <div className='mac-container'>
        <MacNav />
        {
          isMdOpen ? 
          <TyporaWrapper
            classNames={cn({
              'typora-open': isMdOpen
            })}
            category={category}
            name={name}
            saveTempFile={this.saveTempFile}
            onClose={this.handleMdClose}
          /> : null
        }
        
        <div className='mac-container-file'>
        {
          categoryList.map((item, index) => (
            <FileCard 
              name={item.title} 
              key={index} 
              onClick={this.changeCategory.bind(this, item.category)}
            />
          ))
        }
        </div>
        <FileWrapper 
          classNames={cn({
            'filewrapper-open': isOpen
          })}
          category={category} 
          onClose={this.handleClose}
          onFileOpen={this.handleFileOpen}
          isSearch={isSearch}
          searchValue={searchValue}
        />
        { this.renderRecList(curMonthList) }
        <MacBottom 
          handleSearch={this.openSearch} 
          tempFileList={tempFileList}
          onFileOpen={this.handleFileOpen}
        />
        {
          isSearchOpen ? 
          <MacSearch 
            onSearch={this.onSearch}
            onClose={this.handleSearchClose}
          /> : null
        }
      </div>
    )
  }
}

export default MacIndex;
