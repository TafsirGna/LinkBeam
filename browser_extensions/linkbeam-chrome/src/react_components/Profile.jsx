/*import './Profile.css'*/
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import user_icon from '../assets/user_icon.png'
import BackToPrev from "./widgets/BackToPrev";
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { Line, Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Today line plugin block 
const todayLinePlugin = {
  id: "todayLine",
  afterDatasetsDraw(chart, args, pluginOptions){
    const { ctx, data, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(255, 99, 132, 1)";
    ctx.setLineDash([6, 6]);
    ctx.moveTo(x.getPixelForValue(new Date()), top);
    ctx.lineTo(x.getPixelForValue(new Date()), bottom);
    ctx.stroke();

    ctx.setLineDash([]);
  },
};

const barOptions = {
  indexAxis: 'y',
  responsive: true,
  scales: {
    x: {
      position: "top",
      type: "time",
      time: {
        unit: "day",
      },
      min: "2021-12-31",
      max: "2023-12-31",
    },
  },
  plugins: {
    legend: {
      display: false,
    }
  }
};

const labels = ["a", "b", "c", "d"];

const barData = {
  // labels,
  datasets: [
    {
      label: 'Dataset',
      //data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
      data: [
        {x: ["2022-01-01", "2022-12-01"], y: "ENEAM"},  
        {x: ["2022-02-01", "2022-12-01"], y: "IFRI"},  
        {x: ["2022-03-01", "2022-12-01"], y: "FAUCON"},  
        {x: ["2022-04-01", "2022-12-01"], y: "ASSI"},  
        {x: ["2022-05-01", "2022-12-01"], y: "CELTIIS"},  
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      borderSkipped: false,
      borderRadius: 10,
      barPercentage: .5,
    },
  ],
};

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
                overlay={<ReactTooltip id="tooltip1">Cotonou, Littoral, Benin</ReactTooltip>}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mx-2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </OverlayTrigger>
              ·
              <OverlayTrigger
                placement="bottom"
                overlay={<ReactTooltip id="tooltip1">View Cover Image</ReactTooltip>}
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
                <Nav.Link href="#about">About</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#background">Background</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#news">
                  News
                </Nav.Link>
              </Nav.Item>
              {/*<Nav.Item>
                <Nav.Link href="#projects">
                  Projects
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link href="#disabled">
                  Others
                </Nav.Link>
              </Nav.Item>*/}
            </Nav>
          </Card.Header>
          <Card.Body>
            <Bar options={barOptions} data={barData} plugins={[todayLinePlugin]}/>
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
