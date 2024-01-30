/*import './ProfileGeoMapModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { Offcanvas } from "react-bootstrap";
import { 
  sendDatabaseActionMessage, 
  startMessageListener, 
  messageParams, 
  ack, 
  dbData,
  dbDataSanitizer,
  shuffle,
} from "../../Local_library";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie, getElementAtEvent } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


export default class LanguageListModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pieData: null,
      languageData: null,
      chartRef: React.createRef(),
      selectedChartElementIndex: null,
      collapseInfoOpen: false,
      offCanvasShow: false,
    };

    this.setChartData = this.setChartData.bind(this);
    this.onChartClick = this.onChartClick.bind(this);
    this.showBelowDeckInfos = this.showBelowDeckInfos.bind(this);
    this.onHide = this.onHide.bind(this);

  }

  componentDidMount() {

    this.setChartData();

  }

  onChartClick(event){

    var elements = getElementAtEvent(this.state.chartRef.current, event);
    console.log(elements, (elements[0]).index);

    if (elements.length != 0){
      this.showBelowDeckInfos((elements[0]).index);
    }

  }

  handleOffCanvasClose = () => {this.setState({offCanvasShow: false})};

  handleOffCanvasShow = () => {
      this.setState({collapseInfoOpen: false, selectedChartElementIndex: null}, () => {
        this.setState({offCanvasShow: true});
        this.props.onHide();
      });
  };

  setChartData(){

    if (!this.props.profile.languages){
      return;
    }

    var languages = [];

    for (var languageObject of this.props.profile.languages){

      var value = null, proficiency = languageObject.proficiency.toLowerCase();

      if (proficiency.indexOf("native") != -1){ value = 5; }
      if (proficiency.indexOf("full professional") != -1){ value = 4; }
      if (proficiency.indexOf("professional working") != -1){ value = 3; }
      if (proficiency.indexOf("limited working") != -1){ value = 2; }
      if (proficiency.indexOf("elementary") != -1){ value = 1; }
      if (value == null){ value = 0.5; }

      languages.push({
        label: dbDataSanitizer.preSanitize(languageObject.name),
        value: (value / 5) * 100,
      });

    }

    var colors = [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ];

    colors = shuffle(colors);


    this.setState({
      languageData: languages,
      pieData: {
        labels: languages.map((l) => l.label),
        datasets: [
          {
            label: 'Languages (%)',
            data: languages.map((l) => l.value),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
          },
        ],
      }
    });

  }

  showBelowDeckInfos = (elementIndex) => { 
    this.setState({selectedChartElementIndex: elementIndex, /*collapseInfoOpen: true*/}, () => {
      this.setState({collapseInfoOpen: true});
    });
  }

  onHide(){

    this.setState({collapseInfoOpen: false, selectedChartElementIndex: null});

    this.props.onHide();

  }

  render(){
    return (
      <>
        <Modal 
          show={this.props.show} 
          onHide={this.onHide} 
          // size="lg"
          >
          <Modal.Header closeButton>
            <Modal.Title>Languages</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.state.pieData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

            { this.state.pieData && <div class="row">
                                      <div class={"col-6 " + "offset-3"}>
                                        <Pie 
                                          ref={this.state.chartRef}
                                          data={this.state.pieData}
                                          onClick={this.onChartClick}
                                           />
                                      </div>
                                      <div class="col-6">
                                      </div>
                                    </div>}

            { this.state.selectedChartElementIndex != null && 
                                        <Collapse in={this.state.collapseInfoOpen}>
                                          <div id="collapseInfo">
                                            <p class="shadow-sm border mt-4 rounded p-2 text-muted fst-italic small">
                                              {dbDataSanitizer.fullName(this.props.profile.fullName)+" speaks "} 
                                              <span class="rounded p-1 border shadow-sm">{this.state.languageData[this.state.selectedChartElementIndex].label}</span> 
                                              {" as well as "}
                                              <span class="badge text-bg-primary">{/*this.state.followersCompData.value*/0}</span>
                                              {"% of all the profiles you've visited so far." }
                                              <span class="badge text-bg-primary handy-cursor ms-2" onClick={this.handleOffCanvasShow}>{"SHOW"}</span>
                                            </p>
                                          </div>
                                        </Collapse>}


          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        <Offcanvas show={this.state.offCanvasShow} onHide={this.handleOffCanvasClose}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Linked Profiles</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            
          </Offcanvas.Body>
        </Offcanvas>

      </>
    );
  }
}
