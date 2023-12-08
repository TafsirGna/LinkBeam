import '../assets/css/ProfileActivitySectionView.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { activateInCurrentTab } from "../Local_library";

export default class ProfileActivitySectionView extends React.Component{

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
        <section class="py-5 mx-5 small">
          <ul class="timeline-with-icons">
            <li class="timeline-item mb-5">
              <span class="timeline-icon">
                <i class="fas fa-rocket text-primary fa-sm fa-fw"></i>
              </span>

              <h5 class="fw-bold">Our company starts its operations</h5>
              <p class="text-muted mb-2 fw-bold">11 March 2020</p>
              <p class="text-muted">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit
                necessitatibus adipisci, ad alias, voluptate pariatur officia
                repellendus repellat inventore fugit perferendis totam dolor
                voluptas et corrupti distinctio maxime corporis optio?
              </p>
            </li>

            <li class="timeline-item mb-5">

              <span class="timeline-icon">
                <i class="fas fa-hand-holding-usd text-primary fa-sm fa-fw"></i>
              </span>
              <h5 class="fw-bold">First customer</h5>
              <p class="text-muted mb-2 fw-bold">19 March 2020</p>
              <p class="text-muted">
                Quisque ornare dui nibh, sagittis egestas nisi luctus nec. Sed
                aliquet laoreet sapien, eget pulvinar lectus maximus vel.
                Phasellus suscipit porta mattis.
              </p>
            </li>

            <li class="timeline-item mb-5">

              <span class="timeline-icon">
                <i class="fas fa-users text-primary fa-sm fa-fw"></i>
              </span>
              <h5 class="fw-bold">Our team exceeds 10 people</h5>
              <p class="text-muted mb-2 fw-bold">24 June 2020</p>
              <p class="text-muted">
                Orci varius natoque penatibus et magnis dis parturient montes,
                nascetur ridiculus mus. Nulla ullamcorper arcu lacus, maximus
                facilisis erat pellentesque nec. Duis et dui maximus dui aliquam
                convallis. Quisque consectetur purus erat, et ullamcorper sapien
                tincidunt vitae.
              </p>
            </li>

            <li class="timeline-item mb-5">

              <span class="timeline-icon">
                <i class="fas fa-money-bill-wave text-primary fa-sm fa-fw"></i>
              </span>
              <h5 class="fw-bold">Earned the first million $!</h5>
              <p class="text-muted mb-2 fw-bold">15 October 2020</p>
              <p class="text-muted">
                Nulla ac tellus convallis, pulvinar nulla ac, fermentum diam. Sed
                et urna sit amet massa dapibus tristique non finibus ligula. Nam
                pharetra libero nibh, id feugiat tortor rhoncus vitae. Ut suscipit
                vulputate mattis.
              </p>
            </li>
          </ul>
        </section>
      </>
    );
  }
}