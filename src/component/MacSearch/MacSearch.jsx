import React, { Component } from 'react';

import './search.scss';

class MacSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }
  }
  
  handleChange = (e) => {
    this.setState({
      value: e.target.value
    })
  }

  onKeyUp = (e) => {
    if(e.keyCode === 13) {
      let value = this.state.value;
      this.setState({
        value: ''
      })
      this.props.onSearch(value)
    }
  }

  onBlur = () => {
    this.props.onClose();
  }

  render() {
    const { value } = this.state;

    return (
      <div className="macsearch-container">
        <img src="http://p5sf6v0wz.bkt.clouddn.com/blog-mac-search-inset.png" alt="search" className="macsearch-icon"></img>
        <input 
          className="macsearch-input" 
          autoFocus="autofocus" 
          onChange={this.handleChange}
          value={value}
          onKeyUp={this.onKeyUp}
          onBlur={this.onBlur}
        >
        </input>
      </div>
    )
  }
}

export default MacSearch;
