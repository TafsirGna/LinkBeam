/*import './FeedNewPostMeasurementBarChart.css'*/
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { faker } from '@faker-js/faker';
import { 
  getChartColors, 
  dateBetweenRange,
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
      text: 'Old/New Posts Bar Chart',
    },
  },
};

export default class FeedNewPostMeasurementBarChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      barData: null,
    };

    this.setChartData = this.setChartData.bind(this);
  }

  componentDidMount() {

    this.setChartData()

  }

  async setChartData(){

    var uids = [];
    await db.feedPostViews
            .filter(postView => dateBetweenRange(this.props.startDate, this.props.endDate, postView.date))
            .each(postView => {
              if (uids.indexOf(postView.uid) == -1){
                uids.push(postView.uid);
              }
            });   

    var colors = getChartColors(1);

    // setting the bar data
    this.setState({barData: {
        labels: results.map((object) => object.label),
        datasets: [
          {
            label: 'Time spent (minutes)',
            data: results.map((object) => object.count),
            // data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            backgroundColor: colors.borders,
            borderColor: colors.borders,
            borderWidth: 1,
          },
        ],
    }});

  }

  componentDidUpdate(prevProps, prevState){

  }

  render(){
    return (
      <>

        { !this.state.barData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

        { this.state.barData && 
                    <div>
                      <Bar options={barOptions} data={this.state.barData} />
                      { this.props.displayLegend 
                          && this.props.displayLegend == true 
                          && <p class="mt-4 fst-italic fw-bold text-muted border rounded shadow-sm small text-center">
                              Chart of visits of the days with the spent time
                            </p> }
                    </div> }

      </>
    );
  }
}