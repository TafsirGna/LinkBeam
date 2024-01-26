/*import './ProfileGeoMapChart.css'*/
import '../../assets/css/JobListView.css';
import React from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
  sendDatabaseActionMessage, 
  getChartColors, 
  startMessageListener, 
  messageParams, 
  dbData, 
  ack, 
  dbDataSanitizer 
} from "../../Local_library";
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
} from 'chart.js';
import { Colors } from 'chart.js';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import company_icon from '../../../assets/company_icon.png';

// Chart.register(Colors);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
);

const barOptions = {
  responsive: true,
  /*layout: {
    padding: {
      left: 30,
      right: 30
    }
  }*/
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Job titles Chart',
    },
  },
  scales: {
    x: {
      ticks: {
           display: false,
      },
    },
  },
  maintainAspectRatio: false,
};

export default class JobTitlesBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barData: null,
      jobModalShow: false,
      selectedChartElementIndex: null,
      chartRef: React.createRef(),
    };
    this.setBarData = this.setBarData.bind(this);
    this.onChartClick = this.onChartClick.bind(this);
  }

  componentDidMount() {

    if (!this.props.data){
      return;
    }

    this.setBarData();

  }

  handleJobModalClose = () => { 
    this.setState({jobModalShow: false}, 
    () => { this.setState({selectedChartElementIndex: null}); });
  };

  handleJobModalShow = (elementIndex) => { 
    this.setState({selectedChartElementIndex: elementIndex}, 
    () => { 
      this.setState({jobModalShow: true});
    }
  )};

  setBarData(){

    var colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: this.props.data.map((object) => object.label),
        datasets: [
          {
            label: '% Percentage',
            data: this.props.data.map((object) => object.value),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    }});

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.data != this.props.data){
      this.setBarData();
    }

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.handleJobModalShow((elements[0]).index);
    }

  }

  render(){
    return (
      <>

        { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

        { this.state.barData && <Bar 
                                  ref={this.state.chartRef}
                                  height="200" 
                                  options={barOptions} 
                                  data={this.state.barData}
                                  onClick={this.onChartClick} /> }


        <Modal show={this.state.jobModalShow} onHide={this.handleJobModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Job Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { this.state.selectedChartElementIndex && <div>
                                <span class="shadow badge bg-secondary-subtle border border-info-subtle text-info-emphasis rounded-pill">{this.props.data[this.state.selectedChartElementIndex].label}</span>
                                <ul class="timeline mt-4 mx-2 small">
                                  { this.props.profile.experience.map((experience) => (
                                      (dbDataSanitizer.preSanitize(experience.title).toLowerCase() == this.props.data[this.state.selectedChartElementIndex].label.toLowerCase()) 
                                        &&  <li class="timeline-item mb-5 small">
                                              <h6 class="fw-bold">
                                                <span class="shadow-sm badge align-items-center p-1 pe-3 text-secondary-emphasis bg-secondary-subtle border border-secondary-subtle rounded-pill">
                                                  <img class="rounded-circle me-1" width="16" height="16" src={/*profileActivityObject.profile.avatar ? profileActivityObject.profile.avatar :*/ company_icon} alt=""/>
                                                  {dbDataSanitizer.preSanitize(experience.company)}
                                                </span>
                                              </h6>
                                              <p class="text-muted mb-2 fw-light">10 Janvier 2019 - 17 Février 2020</p>
                                              <p class="text-muted border rounded p-2 shadow-sm">
                                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit
                                                necessitatibus adipisci, ad alias, voluptate pariatur officia
                                                repellendus repellat inventore fugit perferendis totam dolor
                                                voluptas et corrupti distinctio maxime corporis optio?
                                              </p>
                                            </li>
                                    )) }
                                </ul>
                              </div>    }      

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleJobModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>


      </>
    );
  }
}