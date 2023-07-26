/*import { useState } from 'react'*/
/*import './About.css'*/
import app_logo from '../assets/app_logo.svg'
import BackToPrev from "./widgets/BackToPrev"

function About(props) {
  /*const [count, setCount] = useState(0)*/

  return (
    <>
      <div class="p-3">
        <BackToPrev onClick={() => props.switchOnDisplay("Activity")}/>
        <div class="text-center">
          <img src={app_logo}  alt=""/>
          <p class="fw-bold mt-2">
            LinkBeam <span class="badge text-bg-primary">0.1.0</span>
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
