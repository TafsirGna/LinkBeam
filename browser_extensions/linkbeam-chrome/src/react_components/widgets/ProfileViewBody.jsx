/*import './ProfileViewReminderModal.css'*/
import React from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
/*import 'bootstrap/dist/css/bootstrap.min.css';*/
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
import { OverlayTrigger } from "react-bootstrap";
import { faker } from '@faker-js/faker';
import 'chartjs-adapter-date-fns';
import { Line, Bar } from 'react-chartjs-2';

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
      backgroundColor: 'rgba(255, 99, 132, 1)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      borderSkipped: false,
      borderRadius: 10,
      barPercentage: .7,
    },
  ],
};

export default class ProfileViewBody extends React.Component{

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
      </>
    );
  }
}
