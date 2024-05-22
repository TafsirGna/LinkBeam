/*import './FeedActiveUserListItemView.css'*/
import React, { useEffect, useState } from 'react';
import default_user_icon from '../../assets/user_icons/default.png';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Tooltip } from "react-bootstrap";
import Spinner from 'react-bootstrap/Spinner';

const bgColors = [
  "bg-primary",
  "bg-secondary",
  "bg-info",
  "bg-danger",
  "bg-warning",
  "bg-success",
  "bg-primary-subtle",
  "bg-secondary-subtle",
  "bg-info-subtle",
  "bg-danger-subtle",
  "bg-warning-subtle",
  "bg-success-subtle",
];


const UpdatingPopover = React.forwardRef(
  ({ popper, children, show: _, ...props }, ref) => {
    useEffect(() => {
      console.log('updating!');
      popper.scheduleUpdate();
    }, [children, popper]);

    return (
      <Popover ref={ref} body {...props}>
        {children}
      </Popover>
    );
  },
);

export const totalInteractions = (object) => {
  var value = 0;
  for (var category in object.feedItemsMetrics){
    value += object.feedItemsMetrics[category];
  }
  return value;
}

export default class FeedActiveUserListItemView extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      totalInteractions: null,
      userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />,
    };

    this.onEnteringUserTooltip = this.onEnteringUserTooltip.bind(this);
    this.onExitingUserTooltip = this.onExitingUserTooltip.bind(this);
  }

  componentDidMount() {

    this.setState({totalInteractions: totalInteractions(this.props.object)});

  }

  componentDidUpdate(prevProps, prevState){

  }

  componentWillUnmount(){

  }

  onEnteringUserTooltip = async () => {

    this.setState({userTooltipContent: <span class="fw-light">{`${this.state.totalInteractions} deeds`} so far</span>});

  }

  onExitingUserTooltip = async () => {

    this.setState({userTooltipContent: <Spinner 
                            animation="border" 
                            size="sm"
                            variant="secondary" />});

  }

  render(){
    return (
      <>
        <div class="d-flex text-body-secondary pt-3 border-bottom">
          <img 
            src={ this.props.object.picture} 
            alt="twbs" 
            width="40" 
            height="40" 
            class="shadow rounded-circle flex-shrink-0 me-2"/>
          <p class="pb-3 mb-0 small lh-sm w-100">
            
              <div class="mb-2">
                <a 
                  class=/*d-block*/" text-gray-dark text-decoration-none text-secondary fst-italic mb-2 fw-bold" 
                  href={this.props.object.url}>
                  <OverlayTrigger 
                    trigger="hover" 
                    placement="top" 
                    onEntering={this.onEnteringUserTooltip}
                    onExiting={this.onExitingUserTooltip}
                    overlay={<UpdatingPopover id="popover-contained">{this.state.userTooltipContent}</UpdatingPopover>}>
                    <span>
                      { this.props.object.name } 
                    </span>
                  </OverlayTrigger>
                </a>
              </div>
              <div class="w-100 p-1">
                
                <div class="progress-stacked shadow border" style={{height: ".5em"}}>
                  { Object.keys(this.props.object.feedItemsMetrics).map((category, index) => (

                      <OverlayTrigger overlay={<Tooltip id={null}>{`${this.props.object.feedItemsMetrics[category]} ${category}`}</Tooltip>}>
                        <div class="progress" role="progressbar" aria-label="Segment one" aria-valuenow={((this.props.object.feedItemsMetrics[category] * 100) / this.state.totalInteractions).toFixed(1)} aria-valuemin="0" aria-valuemax="100" style={{width: `${((this.props.object.feedItemsMetrics[category] * 100) / this.state.totalInteractions).toFixed(1)}%`}}>
                          <div class={`progress-bar ${bgColors[index % bgColors.length]}`}></div>
                        </div>
                      </OverlayTrigger>

                    )) }
                </div>


              </div>

          </p>
        </div>

      </>
    );
  }
}
