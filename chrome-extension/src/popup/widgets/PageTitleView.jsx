/*import './SearchListView.css'*/
import React from 'react';

export default class PageTitleView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

  }

  render(){
    return (
      <>
        <div class="text-center mt-2">
          <span class="badge text-bg-primary shadow">{this.props.pageTitle}</span>
        </div>
      </>
    );
  }
}
