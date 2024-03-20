/*import './PostListItemView.css'*/
import React from 'react';
import moment from 'moment';
import { BarChartIcon } from "./SVGs";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import FeedPostTrendLineChart from "./charts/FeedPostTrendLineChart";
import { db } from "../../db";
import { categoryVerbMap } from "../Local_library";
import default_user_icon from '../../assets/user_icons/default.png';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const popover = (
  <Popover id="popover-basic">
    <Popover.Body>
      And here's some <strong>amazing</strong> content. It's very engaging.
      right?
    </Popover.Body>
  </Popover>
);

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
        <div class="d-flex text-body-secondary pt-3 border-bottom">
          <svg class="bd-placeholder-img flex-shrink-0 me-2 rounded" width="32" height="32" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: 32x32" preserveAspectRatio="xMidYMid slice" focusable="false"><title>Placeholder</title><rect width="100%" height="100%" fill="#007bff"></rect><text x="50%" y="50%" fill="#007bff" dy=".3em">32x32</text></svg>
          <p class="pb-3 mb-0 small lh-sm">
            <OverlayTrigger trigger="hover" placement="left" overlay={popover}>
              <a 
                class="d-block text-gray-dark text-decoration-none text-secondary fst-italic mb-2 fw-bold" 
                href={this.props.object.category 
                        ? this.props.object.initiator.url
                        : this.props.object.content.author.url}>
                { this.props.object.category 
                    ? this.props.object.initiator.name
                    : this.props.object.content.author.name } 
              </a>
            </OverlayTrigger>
            <span>
              <span class="border rounded shadow-sm px-2 me-1">
                { this.props.object.category 
                    ? `${categoryVerbMap[this.props.object.category]} `
                    : " shared" }
              </span>
              this post
              { this.props.object.category 
                  && <span class="ms-1"> 
                      shared by 

                      <span 
                        class="badge align-items-center p-1 pe-2 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill ms-1 py-1 fst-italic">
                        <img 
                          class="rounded-circle me-1" 
                          width="14" 
                          height="14" 
                          src={this.props.object.content.author.picture ? this.props.object.content.author.picture : default_user_icon} 
                          alt=""/>
                        <a 
                          class="text-decoration-none text-muted"
                          href={this.props.object.content.author.url}>
                          {this.props.object.content.author.name}
                        </a>
                      </span>

                    </span>}

            </span>
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

              { this.state.postModalShow 
                  && <FeedPostTrendLineChart
                      objects={this.state.postViews}
                      globalData={this.props.globalData}/> }

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
