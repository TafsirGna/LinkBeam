/*import './FeedPostCategoryDonutChart.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AlertCircleIcon } from "../SVGs";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import FeedPostCategorySizeTrendChart from "./FeedPostCategorySizeTrendChart";
import { 
  getChartColors, 
  categoryVerbMap,
} from "../../Local_library";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  cutout: 60,
};

export default class FeedPostCategoryDonutChart extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      data: null,
      categorySizeTrendModalShow: false,
      selectedCategoryIndex: null,
      chartRef: React.createRef(),
    };

    this.setChartData = this.setChartData.bind(this);
    this.onDonutChartClick = this.onDonutChartClick.bind(this);
  }

  componentDidMount() {

    this.setChartData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

  }

  handleCategorySizeTrendModalClose = () => {this.setState({categorySizeTrendModalShow: false});}
  handleCategorySizeTrendModalShow = () => {this.setState({categorySizeTrendModalShow: true});}

  setChartData(){

    if (!this.props.objects){
      return;
    }

    if (!this.props.objects.length){
      return;
    }

    var labels = [], 
        data = [],
        colors = []; 


    labels = Object.keys(categoryVerbMap).concat(["publications"]);
    
    data = labels.map(label => 0);
    colors = getChartColors(labels.length).borders;

    // setting the labels
    for (var visit of this.props.objects){
      for (var index = 0; index < labels.length; index++){
        var metric = labels[index];
        data[index] += visit.feedItemsMetrics[metric] ? visit.feedItemsMetrics[metric] : 0;
      }
    }

    this.setState({
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Post Count',
            data: data,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      },
    });

  }

  onDonutChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.setState({selectedCategoryIndex: (elements[0]).index}, () => {
        this.handleCategorySizeTrendModalShow();
      });
    }

  }

  render(){
    return (
      <>
        { !this.props.objects && <div class="text-center"><div class="mb-5 mt-4"><div class="spinner-border text-primary" role="status">
                      {/*<span class="visually-hidden">Loading...</span>*/}
                    </div>
                    <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                  </div>
                </div>}

        { this.props.objects 
            && <div>
                { this.props.objects.length == 0 
                  && <div class="text-center m-5">
                      <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">Not enough data to show this chart</span></p>
                    </div>}
                 { this.props.objects.length != 0 
                    && this.state.data 
                    && <div>
                        { this.state.data.datasets[0].data.reduce((acc, a) => acc + a, 0) != 0 /*if the sum of the values isn't zero*/
                            && <div>
                                  <Doughnut 
                                    ref={this.state.chartRef}
                                    data={this.state.data} 
                                    options={options}
                                    onClick={this.onDonutChartClick} />

                                  <Modal show={this.state.categorySizeTrendModalShow} onHide={this.handleCategorySizeTrendModalClose}>
                                    <Modal.Header closeButton>
                                      <Modal.Title>{this.state.selectedCategoryIndex != null ? `Evolution of the ${this.state.data.labels[this.state.selectedCategoryIndex]} count` : null}</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>

                                      <FeedPostCategorySizeTrendChart
                                        objects={this.props.objects}
                                        category={this.state.data.labels[this.state.selectedCategoryIndex]}
                                        rangeDates={this.props.rangeDates}
                                        colors={[this.state.data.datasets[0].borderColor[this.state.selectedCategoryIndex]]}/>

                                    </Modal.Body>
                                    <Modal.Footer>
                                      <Button variant="secondary" size="sm" onClick={this.handleCategorySizeTrendModalClose} className="shadow">
                                        Close
                                      </Button>
                                    </Modal.Footer>
                                  </Modal>
                                </div>}
                        { this.state.data.datasets[0].data.reduce((acc, a) => acc + a, 0) == 0 /*if the sum of the values is zero*/
                            && <div class="text-center m-5 mt-2">
                                <svg viewBox="0 0 24 24" width="100" height="100" stroke="gray" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 mb-3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <p class="mb-2"><span class="badge text-bg-primary fst-italic shadow">Not enough data to show this chart</span></p>
                              </div>}

                      </div> } 

                </div>}

      </>
    );
  }
}