/*import './FeedVisitsScatterPlot.css'*/
import React from 'react'
import * as ChartGeo from "chartjs-chart-geo";
import { Scatter, getElementAtEvent } from 'react-chartjs-2';
import { DateTime as LuxonDateTime } from "luxon";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { AlertCircleIcon } from "../SVGs";
import { OverlayTrigger, Tooltip as ReactTooltip } from "react-bootstrap";
import { 
  getChartColors, 
  getPostCount,
  getVisitsTotalTime,
} from "../../Local_library";
import FeedVisitDataView from "../../FeedVisitDataView";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
// import { faker } from '@faker-js/faker';
import { db } from "../../../db";

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export const options = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Time spent'
      }
    },
    x: {
      title: {
        display: true,
        text: '# of posts'
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: ((tooltipItem, data) => {
          // console.log(tooltipItem);
          return `${LuxonDateTime.fromISO(tooltipItem.raw.dateString).toFormat('MMMM dd yyyy, hh:mm a')}`;
        })
      }
    }
  }
};

export default class FeedVisitsScatterPlot extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      chartRef: React.createRef(),
      data: null,
      selectedFeedVisit: null,
    };

    this.setChartData = this.setChartData.bind(this);
    this.onChartClick = this.onChartClick.bind(this);
  }

  componentDidMount() {

    this.setChartData();

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.objects != this.props.objects){
      this.setChartData();
    }

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);

    if (elements.length){
      console.log(elements, (elements[0]).index, (elements[0]).element.$context.raw.visitId);
      this.handleFeedVisitDataModalShow((elements[0]).element.$context.raw.visitId);
    }

  }

  handleFeedVisitDataModalClose = () => this.setState({selectedFeedVisit: null});
  handleFeedVisitDataModalShow = async (visitId) => this.setState({
    selectedFeedVisit: await db.visits.where({uniqueId: visitId}).first(),
  });

  async setChartData(){

    if (!this.props.objects){
      return;
    }

    this.setState({data: {
        datasets: [
          {
            label: '# of posts/Time spent(mins)',
            data: this.props.objects.map(o => o.visitId)
                                    .filter((value, index, self) => self.indexOf(value) === index)
                                    .map(visitId => ({
                                      x: getPostCount(this.props.objects.filter(view => view.visitId == visitId)),
                                      y: getVisitsTotalTime(this.props.objects.filter(view => view.visitId == visitId)),
                                      dateString: this.props.objects.filter(view => view.visitId == visitId)[0].date,
                                      visitId: visitId,
                                    })),
            backgroundColor: getChartColors(1).borders[0],
          },
        ],
      },
    });

  }

  render(){
    return (
      <>
        { !this.props.objects 
            && <div class="text-center">
                <div class="mb-5 mt-4">
                  <div class="spinner-border text-primary" role="status">
                    {/*<span class="visually-hidden">Loading...</span>*/}
                  </div>
                  <p><span class="badge text-bg-primary fst-italic shadow-sm">Loading...</span></p>
                </div>
              </div>}

        { this.props.objects 
            && <div>
                 { this.state.data 
                      && <Scatter 
                            ref={this.state.chartRef}
                            data={this.state.data} 
                            options={options}
                            onClick={this.onChartClick} /> }
                </div>}


        <Modal 
          show={this.state.selectedFeedVisit} 
          onHide={this.handleFeedVisitDataModalClose}
          size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Feed Visit #{this.state.selectedFeedVisit && this.state.selectedFeedVisit.id}</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <FeedVisitDataView
              context="modal"
              object={this.state.selectedFeedVisit
                        ? (() => {
                            var visit = this.state.selectedFeedVisit;
                            visit.feedPostViews = this.props.objects.filter(view => view.visitId == this.state.selectedFeedVisit.uniqueId);
                            return visit;
                          })()
                        : null}
              globalData={this.props.globalData}/>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.handleFeedVisitDataModalClose} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

      </>
    );
  }
}