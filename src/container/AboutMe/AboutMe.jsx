import React from 'react';

import './about.less';

const AboutMe = () => (
  <div className="about-container">
    <p>徐嘉一</p>
    <p>南京航空航天大学软件工程专业在读 20届毕业</p>
    <p>前端开发者，Javascript爱好者</p>
    <p>微信：eDQ2NzA3MjI4MA==</p>
    <p>曾实习: 九章算法，杭州有赞</p>
    <p>小工具 ↓</p>
    <ul>
      <li>
        <a href="http://www.addoneg.com/js2c/index.html" target="_blank"  rel="noopener noreferrer nofollow">C语言转JS超微型编译器</a>
        <a href="http://www.addoneg.com/exp2nfa/index.html" target="_blank"  rel="noopener noreferrer nofollow">正规式 ←→ NFA</a>
        <a href="http://www.addoneg.com/gifmake/index.html" target="_blank"  rel="noopener noreferrer nofollow">在线GIF图制作~</a>
      </li>
    </ul>
  </div>
);

export default AboutMe;
