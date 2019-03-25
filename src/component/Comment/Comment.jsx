import { useState } from 'react';
import cn from 'astro-classname';

import './comment.scss';

function Comment() {
  const [value, setValue] = useState('');
  const [isSubmit, setSubmit] = useState(false);

  handleSubmit = () => {
    setValue('');
    setSubmit(true);
    setTimeout(() => {
      alert('提交成功，等待后台运营小姐姐审核哦~')
    }, 820)
  }

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
        onClick={this.handleSubmit}
      >Comment</button>
    </div>
  )
}

export default Comment;