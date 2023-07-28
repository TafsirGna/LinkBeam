import React from 'react'
import './App.css'
import app_logo_white from '/app_logo_white.png'
import About from "./react_components/About";
import Activity from "./react_components/Activity";
import Settings from "./react_components/Settings";
import Statistics from "./react_components/Statistics";
import Keywords from "./react_components/Keywords";


export default class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      onDisplay: "Activity",
      globalData: {
        keywordList: null,
        searchList: null,
      }
    };
    this.updateGlobalData = this.updateGlobalData.bind(this);
  }

  componentDidMount() {
  }

  switchOnDisplay = (newValue) => {
    this.setState({onDisplay: newValue});
  }

  updateGlobalData(propName, propValue){
    switch(propName){
      case "ALL":{
        this.setState({globalData: {keywordList: [], searchList: []}});
        // this.setState({globalData: {keywordList: [], searchList: []}}, () => { console.log("All : ", this.state.globalData); });
        
        break;
      }

      case "KEYWORD": {
        this.setState((prevState) => ({
          globalData: {
            keywordList: propValue,
            searchList: prevState.globalData.searchList
          }
        }), () => {console.log("Rooo : ", this.state.globalData)});
        break;
      }

      case "SEARCH": {
        this.setState((prevState) => ({
          globalData: {
            keywordList: prevState.globalData.keywordList,
            searchList: propValue
          }
        }));
        break;
      }
    }
  }

  render(){

    return(
      <>
        {this.state.onDisplay == "Activity" && <Activity globalData={this.state.globalData} onGlobalDataUpdate={this.updateGlobalData} switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "About" && <About switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "Settings" && <Settings globalData={this.state.globalData} onGlobalDataUpdate={this.updateGlobalData} switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "Statistics" && <Statistics globalData={this.state.globalData} switchOnDisplay={this.switchOnDisplay} />}

        {this.state.onDisplay == "Keywords" && <Keywords globalData={this.state.globalData} onGlobalDataUpdate={this.updateGlobalData} switchOnDisplay={this.switchOnDisplay} />}

      </>
    );
  }

}
