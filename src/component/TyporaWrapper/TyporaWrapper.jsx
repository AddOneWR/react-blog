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
      activeId: -1,
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

  scrollView(id) {
    let el = document.getElementById(id);
    let parent = document.getElementById('typora-scroll');
    window.scrollTo ?
      parent.scrollTo({"behavior": "smooth", "top": el.offsetTop - 40}) :
      parent.scrollTop = el.offsetTop - 40;
  }

  getToc = (markdown) => {
    let toc = [];
    let reg = /(#+)\s+?(.+?)\n/g;
    let regExecRes = null
    while((regExecRes = reg.exec(markdown))) {
      toc.push({
        level: regExecRes[1].length,
        title: regExecRes[2]
      });
    }

    this.setState({
      toc: toc
    })

    let parent = document.getElementById('typora-scroll');
    let dec;
    parent.addEventListener('scroll', () => {
      toc.forEach((item, index) => {
        dec = Math.abs(parent.scrollTop - document.getElementById(item.title).offsetTop)
        if(dec <= 40) this.setState({ activeId: index });
      })
    })
  }

  renderMenu = (toc) => (
    <div 
      className="typora-menu-container"
    >
      {
        toc.map((item, index) => 
          <div
            id={`#${item.title}`}
            className={`typora-menu-item level${item.level}`}
            onClick={() => this.scrollView(item.title)}
            key={index}
          >
            <span className={cn({
              'head-active': this.state.activeId === index
            })}>
              {item.title}
            </span>
          </div>
        )
      }
    </div>
  )

  handleSize = () => {
    let size = this.state.size === 'normal' ? 'large' : 'normal';
    this.setState({
      size: size
    })
  }

  render() {
    const { markdown, name, category, toc, size } = this.state;
    const { onClose, classNames, saveTempFile } = this.props;
    return (
      <div 
        className={cn(`typora-container detail-container markdown ${classNames}`, {
          'typora-normal': size === 'normal',
          'typora-large': size === 'large'
        })}
      >
        <div className="typora-banner">
          <div className="typora-banner-wrapper">
            <div className="typora-banner-close contro-btn" onClick={onClose}></div>
            <div 
              className="typora-banner-normal contro-btn" 
              onClick={
                size === 'large' ? 
                  void(0) : 
                  () => saveTempFile(category, name)
                }
            >
            </div>
            <div className="typora-banner-large contro-btn" onClick={this.handleSize}></div>
          </div>
          <div className="typora-banner-title">{name}</div>
        </div>
        <div id="typora-scroll" className="typora-container-flex">
        { toc && this.renderMenu(toc) }
        {
          !markdown ?
          <div className="typora-container-flex-loading">努力加载中(๑•̀ㅂ•́)و✧...</div> :
          <div className="typora-main">
            <div dangerouslySetInnerHTML={{ __html: marked(markdown) }}></div>
          </div>
        }
        </div>
      </div>
    )
  }
}

export default TyporaWrapper;
