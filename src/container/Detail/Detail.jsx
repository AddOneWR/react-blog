import React, { Component } from 'react';
import { Motion, spring } from 'react-motion';
import j2url from 'j2url';
import marked from 'marked';
import hljs from 'highlight.js/lib/highlight';
import Particles from 'react-particles-js';
import Loading from '../../component/Loading/Loading';
import Footer from '../../component/Footer/Footer';

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
    let markdown = require(`../../markdown/${category}/${name}.md`);
    this.getToc(markdown)
    this.setState({
      markdown: markdown,
      name: name
    })
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
      <div>
        {
          !markdown ? 
          <Loading /> :
          <div className="detail-container markdown">
            { this.renderMenu(toc) }
            <Particles 
              className="detail-bg"
              params={{
                particles: {
                  line_linked: {
                    shadow: {
                      enable: true,
                      color: "#393e46",
                      blur: 1
                    }
                  }
                }
              }}
            />
            <div className="detail-name">{name}</div>
            <div dangerouslySetInnerHTML={{ __html: marked(markdown) }}></div>
          </div>
        }
        <Footer />
      </div>
    )
  }
}

export default Detail;
