import React from 'react'
import './App.css'
import About from "./react_components/About";
import Activity from "./react_components/Activity";
import Settings from "./react_components/Settings";


export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      onDisplay: "Activity"
    };
  }

  switchOnDisplay = (newValue) => {
    this.setState({onDisplay: newValue});
  }

  render(){

    return(
      <>
        {
          this.state.onDisplay == "Activity" ?
            (<Activity switchOnDisplay={this.switchOnDisplay} />)           
          :
            this.state.onDisplay == "About" ? 
              (<About switchOnDisplay={this.switchOnDisplay} />)
            :
              this.state.onDisplay == "Settings" ? 
              (<Settings/>)
              :
                <p>Unexpected error</p>
        }
      </>
    );
  }

}
