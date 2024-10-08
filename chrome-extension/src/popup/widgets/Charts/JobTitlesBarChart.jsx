/*import './JobTitlesBarChart.css'*/
import '../../assets/css/JobListView.css';
import React from 'react';
import { Bar, getElementAtEvent } from 'react-chartjs-2';
// import { faker } from '@faker-js/faker';
import { 
  getChartColors, 
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
import EdExpInfoModal from "../Modals/EdExpInfoModal";

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

    if (elements.length){
      console.log(elements, (elements[0]).index);
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


        <EdExpInfoModal 
          show={this.state.jobModalShow} 
          onHide={this.handleJobModalClose} 
          profile={this.props.profile} 
          label={this.state.selectedChartElementIndex != null ? this.props.data[this.state.selectedChartElementIndex].label : null}
          section="experience"
          labelName="title"/>


      </>
    );
  }
}