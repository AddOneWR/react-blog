import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Motion, spring } from 'react-motion';
import markdown from '../../constant/markdown';

import './banner.less';

class Banner extends Component {

  constructor() {
    super();
    this.state = {
      curMonthList: ''
    }
  }
  
  componentDidMount() {
    this.getRecentMd();
    console.log('%cShow Your Code', 'font-size: 50px; background: #222831; color: #fff;padding: 20px 30px');
  }

  getRecentMd = () => {
    let curMonthList = [];
    let now = new Date();
    let lastMonth = new Date(now.getTime() - 7 * 24 * 3600 * 1000 * 4);
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

  renderRecList = (list) => (
    <div className="rec-container">
    {
      list ?
      list.map((item, index) => (
        <Link 
          key={index}
          to={`/detail?category=${item.key}&name=${item.value.title}`}
        >
          {item.value.title}
        </Link>
      )) :
      '懒惰的博主已经一个多星期没更新了，快去催他'
    }
    </div>
  )

  render() {
    const { curMonthList } = this.state;
    return (
      <div className="banner-container">
        <Motion defaultStyle={{x: 5000}} style={{x: spring(0)}}>
          {interpolatingStyle => (
            <div className="banner-top" style={{transform: `translateX(${interpolatingStyle.x}px)`}}>
              <Link to="/about">
              {/* <img src="https://s1.ax1x.com/2018/12/11/FY32DA.jpg" className="banner-top_avatar" alt="avatar"/> */}
              </Link>
            </div>
          )}
        </Motion>
        <Motion defaultStyle={{x: 5000}} style={{x: spring(0)}}>
          {interpolatingStyle => (
            <div className="banner-bottom" style={{transform: `translateX(-${interpolatingStyle.x}px)`}}>
              <div className="banner-bottom_name">AddOne</div>
              <div className="banner-bottom_desc">哈哈，我特么来了哦</div>
              <div className="banner-bottom_link">
                <a href="https://github.com/AddOneDn" target="_blank" rel="noopener noreferrer nofollow" className="item">Github</a>
                <a href="https://juejin.im/user/5800c5b267f3560058a9f89f" target="_blank"  rel="noopener noreferrer nofollow" className="item">掘金</a>
                <a href="https://www.npmjs.com/~xujiayihaoren1" target="_blank" rel="noopener noreferrer nofollow" className="item">NPM</a>
              </div>
              <Motion defaultStyle={{r: 720*12}} style={{r: spring(0)}}>
              {
                interpolatingStyle => (
                  <Link to='/category'>
                    <div
                      className="banner-bottom_btn" 
                      style={{transform: `rotate(${interpolatingStyle.r}deg)`}}
                    >
                      Enter
                    </div>
                  </Link>
                )
              }
              </Motion>
              { this.renderRecList(curMonthList) }
            </div>
          )}
        </Motion>
      </div>
    )
  }
}

export default Banner;