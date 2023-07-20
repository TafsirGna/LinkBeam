/*import { useState } from 'react'*/
/*import './About.css'*/
import app_logo from '../assets/app_logo.svg'

function About(props) {
  /*const [count, setCount] = useState(0)*/

  return (
    <>
      <div class="card m-2 shadow small">
        <h5 class="card-header">
          <svg onClick={() => props.switchOnDisplay("Activity")} viewBox="0 0 24 24" width="24" height="24" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 me-3 handy-cursor"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          About
        </h5>
        <div class="card-body text-center">
          <img src={app_logo}  alt=""/>
          <p class="fw-bold mt-2">
            LinkBeam <span class="badge text-bg-primary">1.0</span>
          </p>
          <p class="fw-light mt-2">
            LinkBeam is a light app designed to vizualize in a different way all publicly available linkedin profiles.
          </p>
          <p class="mt-2 small">
            Designed by Tafsir GNA.
          </p>
        </div>
      </div>
    </>
  )
}

export default About
