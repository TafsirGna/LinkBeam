import React from 'react';
import './App.css';
import InstallView from "./react_components/InstallView";

export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {

    }
  };

  componentDidMount() {

  }

  render(){

    return(
      <>
      
        <InstallView />

      </>
    );
  }

}
