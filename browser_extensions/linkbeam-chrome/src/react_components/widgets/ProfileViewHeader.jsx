/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/

export default class ProfileViewHeader extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  handleCoverImageModalClose = () => this.setState({coverImageModalShow: false});
  handleCoverImageModalShow = () => this.setState({coverImageModalShow: true});

  render(){
    return (
      <>
        <div class="card mb-3 shadow mt-1">
          <div class="card-body text-center">
            <img src={default_user_icon} alt="twbs" width="60" height="60" class="shadow rounded-circle flex-shrink-0 mb-4"/>
            <h5 class="card-title">{ this.props.profile.fullName }</h5>
            {/*<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>*/}
            <p class="card-text mb-1"><small class="text-body-secondary">{ this.props.profile.title }</small></p>
            <p class="shadow card-text fst-italic opacity-50 badge bg-light-sbtle text-light-emphasis rounded-pill border border-info-subtle"><small class="text-body-secondary">{this.props.profile.nFollowers} · {this.props.profile.nConnections} </small></p>
            <p class="card-text mb-1 text-center text-muted">
              { this.props.profile.location && <OverlayTrigger
                              placement="bottom"
                              overlay={<ReactTooltip id="tooltip1">{this.props.profile.location}</ReactTooltip>}
                            >
                              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            </OverlayTrigger>}
              { this.props.profile.coverImage && <span>
                              ·
                              <OverlayTrigger
                                placement="bottom"
                                overlay={<ReactTooltip id="tooltip1">View Cover Image</ReactTooltip>}
                              >
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2" onClick={this.handleCoverImageModalShow}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                              </OverlayTrigger>
                            </span>}
              { this.props.profile.bookmark && <span>
                  ·
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<ReactTooltip id="tooltip1">Bookmarked</ReactTooltip>}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                  </OverlayTrigger>
                </span>}
              { this.props.profile.reminder && <span>
                  ·
                  <OverlayTrigger
                    placement="bottom"
                    overlay={<ReactTooltip id="tooltip1">Here the reminder text</ReactTooltip>}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>
                  </OverlayTrigger>
                </span>}
            </p>
          </div>
        </div>

        {/* Cover Image Modal */}
        <Modal size="lg" show={this.state.coverImageModalShow} onHide={this.handleCoverImageModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Cover Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
            <img src={this.props.profile.coverImage} class="rounded shadow"/>

          </Modal.Body>
        </Modal>
      </>
    );
  }
}
