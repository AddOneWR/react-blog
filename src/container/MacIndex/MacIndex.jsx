import React, { Component } from 'react';
import cn from 'astro-classname';

import FileCard from '../../component/FileCard/FileCard';
import FileWrapper from '../../component/FileWrapper/FileWrapper';
import MacBottom from '../../component/MacBottom/MacBottom';
import MacNav from '../../component/MacNav/MacNav';
import categoryList from '../../constant/category';
import './macIndex.scss';

class MacIndex extends Component {

  state = {
    category: 'react',
    isOpen: false
  }

  changeCategory = (category) => {
    if(!this.state.isOpen) this.setState({ isOpen: true })
    this.setState({
      category: category
    })
  }
  
  handleClose = () => {
    this.setState({
      isOpen: false
    })
  }

  render() {
    const { category, isOpen } = this.state;
    return (
      <div className='mac-container'>
        <MacNav />
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
        />
        <MacBottom />
      </div>
    )
  }
}

export default MacIndex;
