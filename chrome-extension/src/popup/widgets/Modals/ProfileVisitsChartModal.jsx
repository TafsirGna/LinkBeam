/*******************************************************************************

    LinkBeam - a basic extension for your linkedin browsing experience
    Copyright (C) 2024-present Stoic Beaver

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/TafsirGna/LinkBeam
*/

/*import './ProfileVisitsChartModal.css'*/
import React from 'react'
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { DateTime as LuxonDateTime } from "luxon";
import VisitsTimelineChart from "../Charts/VisitsTimelineChart";
import { 
  getPeriodVisits,
  appParams,
  getPeriodLabel,
} from "../../Local_library";
import { db } from "../../../db";
import { CheckIcon } from "../SVGs";
import { liveQuery } from "dexie"; 

export default class ProfileVisitsChartModal extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      view: 0,
      periodVisits: null,
    };

    this.onViewChange = this.onViewChange.bind(this);
    this.setPeriodVisits = this.setPeriodVisits.bind(this);

  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState){

    if (prevProps.show != this.props.show){
      if (this.props.show){
        // this.setPeriodVisits();

        this.timeCountSubscription = liveQuery(() => db.visits.where({url: this.props.profile.url}).last()).subscribe(
          result => { this.setPeriodVisits(); },
          error => this.setState({error})
        );

      }
      else{
        if (this.timeCountSubscription) {
          this.timeCountSubscription.unsubscribe();
          this.timeCountSubscription = null;
        }
      }
    }

  }

  async setPeriodVisits(){

    var periodVisits = await getPeriodVisits(this.state.view, LuxonDateTime, db, "profiles", this.props.profile.url);
    this.setState({periodVisits: periodVisits});

  }

  onViewChange(index){

    this.setState({view: index}, () => {
      this.setPeriodVisits();
    });

  }

  render(){
    return (
      <>
        <Modal show={this.props.show} onHide={this.props.onHide}>
          <Modal.Header closeButton>
            <Modal.Title>Visits Chart</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            {/*View dropdown*/}
            <div class="clearfix">
              <div class="btn-group float-end">
                <button class="btn btn-primary btn-sm dropdown-toggle fst-italic badge" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  View
                </button>
                <ul class="dropdown-menu shadow">

                  { Array.from({length: 3}).map((_, item) => (<li>
                                                  <a 
                                                    class={`dropdown-item small ${this.state.view == item ? "active" : ""}`} 
                                                    href="#" 
                                                    onClick={() => {this.onViewChange(item)}}>
                                                    {getPeriodLabel(item)}
                                                    { this.state.view == item 
                                                        && <CheckIcon 
                                                            size="20" 
                                                            className="float-end"/>}
                                                  </a>
                                                </li>)) }

                </ul>
              </div>
            </div>

            { <VisitsTimelineChart view={this.state.view} objects={this.state.periodVisits} /> }

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
