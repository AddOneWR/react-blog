import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import { Link } from 'react-router-dom';
import j2url from 'j2url';
import mdList from '../../constant/markdown';

import './list.scss';

class List extends Component {
  componentDidMount() {
    let searchValue = j2url.getParam(window.location.href, 'search');
    if (searchValue) {
      let searchList = {
        desc: '',
        list: []
      };

      Object.keys(mdList).forEach((key) => {
        mdList[key].list.forEach((item) => {
          if (item.title.toLowerCase().search(searchValue.toLowerCase()) !== -1) {
            item.category = key;
            searchList.list.push(item);
          }
        })
      })

      searchList.list.sort(
        (b, a) => Date.parse(a.time) - Date.parse(b.time)
      );

      this.setState({
        mdList: searchList
      })

      return;
    }

    let category = j2url.getParam(window.location.href, 'category');

    if (!mdList[category]) {
      return;
    }

    mdList[category].list.sort(
      (b, a) => Date.parse(a.time) - Date.parse(b.time)
    );

    this.setState({
      mdList: mdList[category],
      category: category
    })
  }

  render() {
    const { mdList, category } = this.state;
    return (
      <div className="list-container">
        <div className="list-main">
          <Motion defaultStyle={{ x: 5000 }} style={{ x: spring(0) }}>
            {interpolatingStyle => (
              <div
                className="list-desc"
                style={{ transform: `translateX(${interpolatingStyle.x}px)` }}
              >
                {mdList && mdList.desc}
              </div>
            )}
          </Motion>
          {
            mdList && mdList.list.map(item => (
              <Motion defaultStyle={{ x: 0 }} style={{ x: spring(1) }} key={item.time}>
                {interpolatingStyle => (
                  <Link to={`/detail?category=${category ? category : item.category}&name=${item.title}`} style={{ color: '#fff' }}>
                    <div
                      className="list-item"
                      style={{ opacity: interpolatingStyle.x }}
                    >
                      <div className="list-item_title">{item.title}</div>
                      <div className="list-item_desc">{item.desc}</div>
                      <div className="list-item_time">{item.time}</div>
                    </div>
                  </Link>
                )}
              </Motion>
            ))
          }
        </div>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div>
      </div>
    )
  }
}

export default List;