import React, { Component } from 'react';
import friends from '../../constant/friends';
import './footer.scss';

class Footer extends Component {
  render() {
    return (
      <div className="footer-container">
        <div className="footer-friend">
          <span>友情链接: </span>
          {
            friends.map((item, index) => (
              <a 
                key={item.name} 
                href={item.link} 
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="footer-friend_link"
              >
                {item.name}{index !== friends.length - 1 ? '/' : null}
              </a>
            ))
          }
        </div>
        <div className="footer-tips">If you find that the style is confusing when you browse, or if you don't understand this sentence, then you may not be suitable for watching my blog.</div>
        <div className="footer-tips">
          <span role="img" aria-label="heart" className="footer-emoji">💖</span>
          微信 eDQ2NzA3MjI4MA==
          <span role="img" aria-label="kiss" className="footer-emoji">😙</span>
        </div>
        <div className="footer-copyright">© 2017 - 2018 By AddOneG</div>
      </div>
    )
  }
}

export default Footer;