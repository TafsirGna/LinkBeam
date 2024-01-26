/*import './ProfileGeoMapModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
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
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


export default class LanguageListModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      pieData: null,
    };

    this.setChartData = this.setChartData.bind(this);

  }

  componentDidMount() {

    this.setChartData();

  }

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

  listenToMessages(){

    
  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Languages</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            { !this.state.pieData && <div class="spinner-border spinner-border-sm" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                          </div> }

            { this.state.pieData && <Pie data={this.state.pieData} />}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="sm" onClick={this.props.onHide} className="shadow">
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
