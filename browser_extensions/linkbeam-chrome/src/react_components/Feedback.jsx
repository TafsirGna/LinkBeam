/*import './About.css'*/
import React from 'react'
import BackToPrev from "./widgets/BackToPrev"
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { saveCurrentPageTitle } from "./Local_library";

export default class Feedback extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

    saveCurrentPageTitle("Feedback");

  }

  render(){
    return (
      <>
        <div class="p-3">
          <BackToPrev prevPageTitle="About"/>
          <div class="">
            <div class="mb-1 mt-3">
              <label for="exampleFormControlInput1" class="form-label text-muted small fst-italic">Subject</label>
              <input type="email" class="form-control shadow-sm" id="exampleFormControlInput1" placeholder="name@example.com"/>
            </div>
            <div class="mb-3">
              <label for="exampleFormControlTextarea1" class="form-label text-muted small fst-italic">Text</label>
              <textarea class="form-control shadow-sm" id="exampleFormControlTextarea1" rows="3"></textarea>
            </div>
            <div class="clearfix">
              <button type="button" class="btn btn-primary btn-sm float-end shadow-sm">Send</button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
