import React, { Component } from 'react';
import Banner from '../../component/Banner/Banner';
import Footer from '../../component/Footer/Footer';

import './index.scss';

class Index extends Component {
  render() {
    return (
      <div className='index-container'>
        <Banner />
        <Footer />
      </div>
    )
  }
}

export default Index;