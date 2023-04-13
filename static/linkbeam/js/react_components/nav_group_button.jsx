import 'vite/modulepreload-polyfill';
import NavButton from "./nav_button" 

export default function NavGroupButton(){
	return(
		<>
			<div class="btn-group btn-group-sm">
				<NavButton/>
			</div>
		</>
	);
}