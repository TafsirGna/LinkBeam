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

/*import './BackToPrev.css'*/
import { appParams } from "../Local_library";
import { switchToView } from "../Local_library";
import eventBus from "../EventBus";

function BackToPrev(props) {
  /*const [count, setCount] = useState(0)*/

  return (
    <>
    	<div class="clearfix">
        <a 
          href="#"
          onClick={() => {switchToView(eventBus, props.prevPageTitle)}}
          title={"Back" + (props.prevPageTitle == appParams.COMPONENT_CONTEXT_NAMES.HOME ? "" : " to " + props.prevPageTitle)}>
       		<svg viewBox="0 0 24 24" width="20" height="20" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 me-3 handy-cursor float-start"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </a>
       	</div>
    </>
  )
}

export default BackToPrev