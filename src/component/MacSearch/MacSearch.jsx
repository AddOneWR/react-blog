import React, { useState } from 'react';

import './search.scss';

const MacSearch = ({ onSearch, onClose }) => {
  const [value, setValue] = useState('');

  return (
    <div className="macsearch-container">
      <img src="https://s1.ax1x.com/2018/11/21/F9hlgx.png" alt="search" className="macsearch-icon"></img>
      <input 
        className="macsearch-input" 
        autoFocus="autofocus" 
        onChange={(e) => setValue(e.target.value)}
        value={value}
        onKeyUp={(e) => {
          if(e.keyCode === 13) {
            setValue('');
            onSearch(value)
          }
        }}
        onBlur={onClose}
      >
      </input>
    </div>
  )
}

export default MacSearch;
