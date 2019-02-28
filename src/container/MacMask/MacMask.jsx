import React from 'react';
import { Link } from 'react-router-dom';
import './mask.scss';

const MacMask = () => (
  <div className="mask-container">
    <div className="mask-main">
      <img src="https://s1.ax1x.com/2018/12/11/FY32DA.jpg" className="mask-avatar" alt="avatar" width="80" height="80"/>
      <p>徐嘉一(AddOneG)</p>
      <p>南京航空航天大学软件工程专业在读 20届毕业</p>
      <p>前端开发者，Javascript爱好者</p>
      <p>微信：x467072280</p>
      <p>曾实习: 北京览众，杭州有赞</p>
      <Link to='/mac'>
        <div className="mask-btn">
          Enter
        </div>
      </Link>
    </div>
  </div>
)

export default MacMask;
