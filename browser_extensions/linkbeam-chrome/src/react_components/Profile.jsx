/*import './Profile.css'*/
import React from 'react';
import user_icon from '../assets/user_icon.png'
import BackToPrev from "./widgets/BackToPrev";
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default class Profile extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      coverImageModalShow: false,
    };
  }

  componentDidMount() {

  }


  handleClose = () => this.setState({coverImageModalShow: false});
  handleShow = () => this.setState({coverImageModalShow: true});

  render(){
    return (
      <>
        <div class="col-8 offset-2">

        {/* Cover image */}
        {/*<div class="mt-5 clearfix">
          <Button title="Cover Image" className="border border-secondary-subtle shadow-sm float-end" variant="outline-secondary" size="sm" onClick={this.handleShow}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </Button>
        </div>*/}

        <div class="card mb-3 shadow mt-5">
          <div class="card-body text-center">
            <img src={user_icon} alt="twbs" width="60" height="60" class="shadow rounded-circle flex-shrink-0 mb-4"/>
            <h5 class="card-title">Tafsir GNA</h5>
            {/*<p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>*/}
            <p class="card-text mb-1"><small class="text-body-secondary">Software Engineer</small></p>
            <p class="card-text fst-italic opacity-50 badge bg-light-subtle text-light-emphasis rounded-pill border border-info-subtle"><small class="text-body-secondary">0 followers · 0 connections</small></p>
            <p class="card-text mb-1 text-center text-muted">
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">Cotonou, Littoral, Benin</Tooltip>}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </OverlayTrigger>
              ·
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="tooltip1">View Cover Image</Tooltip>}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2" onClick={this.handleShow}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </OverlayTrigger>
            </p>
          </div>
        </div>

        <Card className="shadow mt-4">
          <Card.Header>
            <Nav variant="tabs" defaultActiveKey="#first">
              <Nav.Item>
                <Nav.Link href="#first">About</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#link">Education</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#disabled">
                  Experience
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#disabled">
                  News
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#disabled">
                  Projects
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#disabled">
                  Others
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Card.Title>Special title treatment</Card.Title>
            <Card.Text>
              With supporting text below as a natural lead-in to additional content.
            </Card.Text>
            <Button variant="primary">Go somewhere</Button>
          </Card.Body>
        </Card>
        </div>



        {/* Cover Image Modal */}
        <Modal size="lg" show={this.state.coverImageModalShow} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        </Modal>
      </>
    );
  }
}
