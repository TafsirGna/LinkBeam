/*import './BackToPrev.css'*/
import { Link } from 'react-router-dom';
import { appParams } from "../Local_library";

function BackToPrev(props) {
  /*const [count, setCount] = useState(0)*/

  return (
    <>
    	<div class="clearfix" title={"Back" + (props.prevPageTitle == appParams.COMPONENT_CONTEXT_NAMES.HOME ? "" : " to " + props.prevPageTitle)}>
        <Link to={"/index.html" + (props.prevPageTitle == appParams.COMPONENT_CONTEXT_NAMES.HOME ? "?origin=inside" : "/" + props.prevPageTitle)}>
       		<svg viewBox="0 0 24 24" width="20" height="20" stroke="gray" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1 me-3 handy-cursor float-start"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </Link>
       	</div>
    </>
  )
}

export default BackToPrev