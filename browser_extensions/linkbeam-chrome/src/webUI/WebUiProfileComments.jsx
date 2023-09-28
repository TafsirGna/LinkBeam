/*import './WebUiProfileComments.css'*/
import React from 'react';
import { 
  appParams,
} from "../react_components/Local_library";
import WebUiCommentListModal from "./widgets/WebUiCommentListModal";
// import "./styles.min.css";

export default class WebUiProfileComments extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  render(){
    return (
      <>
        <div class="pt-5">
          <WebUiCommentListModal showOnMount={true} appSettingsData={this.props.appSettingsData}/>
        </div>
      </>
    );
  }
}
