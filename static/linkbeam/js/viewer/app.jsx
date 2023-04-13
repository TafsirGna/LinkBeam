import 'vite/modulepreload-polyfill';
import { createRoot } from 'react-dom/client';
import NavGroupButton from "../react_components/nav_group_button";

const root = createRoot(document.getElementById('root_component'));

export default function ViewerApp(){
	return(
		<div>
			<NavGroupButton/>
		</div>
	);
};

root.render(<ViewerApp/>);