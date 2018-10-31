import React from 'react';
import friends from '../../constant/friends';

import './footer.scss';

const Footer = () => (
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
    <div className="footer-copyright">© 2017 - 2018 By AddOneG</div>
  </div>
)

export default Footer;
