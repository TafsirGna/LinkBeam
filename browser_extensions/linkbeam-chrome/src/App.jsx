import React from 'react'
import './App.css'
import app_logo_white from '/app_logo_white.png'
import About from "./react_components/About";
import Activity from "./react_components/Activity";
import Settings from "./react_components/Settings";
import Statistics from "./react_components/Statistics";


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
              (<Settings switchOnDisplay={this.switchOnDisplay} />)
              :
                this.state.onDisplay == "Statistics" ? 
                (<Statistics/>)
                :
                  <p>Unexpected error</p>
        }
      </>
    );
  }

}
