import React, { useState } from 'react';
import cn from 'astro-classname';

import './comment.scss';

function Comment() {
  const [value, setValue] = useState('');
  const [isSubmit, setSubmit] = useState(false);

  return (
    <div className={cn("comment-container", {
      'comment-submit': isSubmit
    })}>
      <input 
        className="comment-input"
        placeholder="说句话吧~"
        onChange={(e) => setValue(e.target.value)}
        value={value}
      >
      </input>
      <button 
        className="comment-btn"
      >Comment</button>
    </div>
  )
}

export default Comment;