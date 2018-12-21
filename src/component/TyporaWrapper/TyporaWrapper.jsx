import React, { Component } from 'react';
import marked from 'marked';
import hljs from 'highlight.js';
import cn from 'astro-classname';

import '../../container/Detail/detail.scss';
import './typora.scss';

class TyporaWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: '',
      category: props.category,
      name: props.name,
      size: 'normal'
    }
  }

  componentDidMount() {
    marked.setOptions({
      highlight: code => hljs.highlightAuto(code).value,
    });
    let category = this.state.category;
    let name = this.state.name;
    try {
      fetch(`../../markdown/${category}/${name}.md`)
        .then(res => {
          let markdown = res.text()
          return markdown;
        })
        .then(markdown => {
          setTimeout(() => {
            this.getToc(markdown);
            this.setState({
              markdown: markdown,
              name: name
            })
          }, 800);
        })
    } catch (err) {
      this.setState({
        markdown: '# 不要闲着没事乱改URL'
      })
    }
  }

  getToc = (markdown) => {
    let toc = [];
    let reg = /(#+)\s+?(.+?)\n/g;
    let regExecRes = null
    while((regExecRes = reg.exec(markdown))) {
      console.log(regExecRes)
      toc.push({
        level: regExecRes[1].length,
        title: regExecRes[2]
      });
    }
    this.setState({
      toc: toc
    })
  }

  renderMenu = (toc) => (
    <div 
      className="typora-menu-container"
    >
      {
        toc && toc.map((item, index) => 
          <a href={`#${item.title}-`} key={index}>
            <div 
              className={`typora-menu-item level${item.level}`}
            >
              {item.title}
            </div>
          </a>
        )
      }
    </div>
  )

  handleSize = (size) => {
    this.setState({
      size: size
    })
  }

  render() {
    const { markdown, name, toc, size } = this.state;
    const { onClose, classNames } = this.props;
    return (
      <div className={cn(`typora-container detail-container markdown ${classNames}`, {
        'typora-normal': size === 'normal',
        'typora-large': size === 'large'
      })}>
        <div className="typora-banner">
          <div className="typora-banner-close contro-btn" onClick={onClose}></div>
          <div className="typora-banner-normal contro-btn" onClick={this.handleSize.bind(this, 'normal')}></div>
          <div className="typora-banner-large contro-btn" onClick={this.handleSize.bind(this, 'large')}></div>
          <div className="typora-banner-title">{name}</div>
        </div>
        <div className="typora-container-flex">
        { this.renderMenu(toc) }
        {
          !markdown ?
          <div className="typora-container-flex-loading">努力加载中(๑•̀ㅂ•́)و✧...</div> :
          <div dangerouslySetInnerHTML={{ __html: marked(markdown) }} className="typora-main"></div>
        }
        </div>
      </div>
    )
  }
}

export default TyporaWrapper;