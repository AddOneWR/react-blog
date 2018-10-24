import React, { Component } from 'react';
import cn from 'astro-classname';

import './comment.scss';

class Comment extends Component {
  state = {
    val: '',
    isSubmit: false
  }

  handleChange = (e) => {
    this.setState({
      val: e.target.value
    })
  }

  handleSubmit = () => {
    this.setState({
      val: '',
      isSubmit: true
    });
    setTimeout(() => {
      alert('提交成功，等待后台运营小姐姐审核哦~')
    }, 820)
  }

  render() {
    const { val, isSubmit } = this.state;
    return (
      <div className={cn("comment-container", {
        'comment-submit': isSubmit
      })}>
        <input 
          className="comment-input"
          placeholder="说句话吧~"
          onChange={this.handleChange}
          value={val}
        >
        </input>
        <button 
          className="comment-btn"
          onClick={this.handleSubmit}
        >Comment</button>
      </div>
    )
  }
}

export default Comment;