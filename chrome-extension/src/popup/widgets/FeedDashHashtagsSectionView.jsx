/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './FeedDashHashtagsSectionView.css'*/
import React from 'react';
import eventBus from "../EventBus";
import { 
  appParams,
} from "../Local_library";
import { DateTime as LuxonDateTime } from "luxon";
import { AlertCircleIcon, LayersIcon } from "./SVGs";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { 
  OverlayTrigger, 
  Tooltip as ReactTooltip, 
  // Popover, 
} from "react-bootstrap";
import HashtagGraphChart from "./charts/HashtagGraphChart";

export default class FeedDashHashtagsSectionView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      modalShow: false,
    };
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){


  }

  componentWillUnmount() {

  }

  handleModalClose = () => {this.setState({modalShow: false})};
  handleModalShow = () => {this.setState({modalShow: true})};

  render(){
    return (
      <>
        
        <div class="my-2 p-3 bg-body rounded shadow border mx-3">
          <h6 class="border-bottom pb-2 mb-0">
            Hashtags
            <div class="dropdown float-end bd-gray">
              <div class="dropdown-toggle handy-cursor" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">
                <LayersIcon 
                  size="18" 
                  className="text-muted"/>
              </div>
              <ul class="dropdown-menu shadow-lg">
                <li><a class="dropdown-item small" href="#" onClick={this.handleModalShow}>Network chart</a></li>
              </ul>
            </div>
          </h6>

          { !this.props.postsReferences 
              && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                </div>
              </div>}

          { this.props.postsReferences 
            && <>
              {Object.keys(this.props.postsReferences).length == 0
                && <div class="text-center m-5">
                      <AlertCircleIcon size="100" className="text-muted"/>
                      <p><span class="badge text-bg-primary fst-italic shadow">No recorded references yet</span></p>
                    </div>}

              { Object.keys(this.props.postsReferences).length != 0
                  && <div class="mt-2">
                     { this.props.postsReferences.map(object => (<OverlayTrigger
                                                                    placement="top"
                                                                    overlay={<ReactTooltip id="tooltip1">{`${object.feedPosts.length} post${object.feedPosts.length > 1 ? "s" : ""} associated`}</ReactTooltip>}
                                                                  >
                                                                  <span 
                                                                    class={/*handy-cursor */`mx-2 badge bg-secondary-subtle border-secondary-subtle text-secondary-emphasis border rounded-pill` /*shadow*/}
                                                                    /*onClick={() => {}}*/>
                                                                    {`${object.text} (${object.feedPosts.length})`}
                                                                  </span>
                                                                  </OverlayTrigger>))}
                    </div>}
              </>}

        </div>


        {/*Modals */}
        <Modal show={this.state.modalShow} onHide={this.handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Hashtags Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

              <HashtagGraphChart
                objects={this.props.postsReferences}/>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}
