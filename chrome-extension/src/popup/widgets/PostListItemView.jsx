/*import './PostListItemView.css'*/
import React from 'react';
import moment from 'moment';
import { BarChartIcon } from "./SVGs";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FeedPostTrendLineChart from "./charts/FeedPostTrendLineChart";
import { db } from "../../db";

export default class PostListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      postViews: null,
      postModalShow: false,
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

  }

  handlePostModalClose = () => this.setState({postModalShow: false});
  handlePostModalShow = () => this.setState({postModalShow: true}, async () => {
    if (this.state.postViews){
      return;
    }

    const views = await db.feedPostViews
                          .where("uid")
                          .equals(this.props.object.uid)
                          .sortBy("date");

    this.setState({postViews: views});

  });

  render(){
    return (
      <>
        <div class="d-flex text-body-secondary pt-3">
          <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
          <p class="pb-3 mb-0 small lh-sm border-bottom">
            <strong class="d-block text-gray-dark">{`@${this.props.object.content.author.name}`}</strong>
            <span>Some representative placeholder content, with some information about this user. Imagine this being some sort of status update, perhaps?</span>
            <div class="mt-3">
              <span class="border shadow-sm rounded p-1 text-muted">
                <span  onClick={this.handlePostModalShow} class="handy-cursor mx-1 text-primary">
                  <BarChartIcon size="16"/>
                </span>
              </span>
            </div>
          </p>
        </div>

        {/*Modal*/}
        <Modal 
          show={this.state.postModalShow} 
          onHide={this.handlePostModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Post</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              {/*<FeedPostTrendLineChart
                objects={this.state.postViews}/>*/}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handlePostModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
