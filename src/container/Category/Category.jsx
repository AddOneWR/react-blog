import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { Link } from 'react-router-dom';
import category from '../../constant/category';

import './category.less';

class Category extends Component {
  render() {
    return (
      <div className="category-container">
        {category.map((item, index) => 
          <Motion defaultStyle={{x: (index + 1) * 800}} style={{x: spring(0)}} key={index}>
            {interpolatingStyle => (
              <div 
                className="category-item" 
                style={{transform: index % 2 === 0 ? `translateX(-${interpolatingStyle.x}px)` : `translateX(${interpolatingStyle.x}px)`}}
              >
                <Link to={`/list?category=${item.category}`} className="category-item_link">
                  <div className="category-item_desc">
                    <div className="title">{item.title}</div>
                    <div className="desc">{item.desc}</div>
                  </div>
                </Link>
              </div>
            )}
          </Motion>
        )}
      </div>
    )
  }
}

export default Category;