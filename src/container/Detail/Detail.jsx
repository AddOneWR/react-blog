import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import j2url from 'j2url';
import marked from 'marked';
import hljs from 'highlight.js';
import Loading from '../../component/Loading/Loading';
import Footer from '../../component/Footer/Footer';
import DetailBg from '../../component/DetailBg/DetailBg';

import './detail.scss';

class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markdown: ''
    }
  }

  componentDidMount() {
    marked.setOptions({
      highlight: code => hljs.highlightAuto(code).value,
    });
    let href = window.location.href;
    let category = j2url.getParam(href, 'category');
    let name = j2url.getParam(href, 'name');
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
    <Motion defaultStyle={{x: 2000}} style={{x: spring(0)}}>
    {
      interpolatingStyle => (
        <div 
          className="detail-menu-container"
          style={{transform: `translateX(-${interpolatingStyle.x}px)`}}
        >
          {
            toc && toc.map((item, index) => 
            <a href={`#${item.title}-`} key={index}>
              <div 
                className={`detail-menu-item level${item.level}`}
              >
                {item.title}
              </div>
            </a>
          )}
        </div>
      )
    }
    </Motion>
  )

  render() {
    const { markdown, name, toc } = this.state;
    return(
      <div className="main-container">
        {
          !markdown ? 
          <Loading /> :
          <div className="detail-container markdown">
            { this.renderMenu(toc) }
            <div className="detail-name">{name}</div>
            <div dangerouslySetInnerHTML={{ __html: marked(markdown) }}></div>
            <DetailBg />
          </div>
        }
        { markdown ? <Footer /> : ''}
      </div>
    )
  }
}

export default Detail;
