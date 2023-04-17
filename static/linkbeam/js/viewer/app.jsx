import 'vite/modulepreload-polyfill';
import { createRoot } from 'react-dom/client';
import NavGroupButton from "../react_components/nav_group_button";
import UserInfosCard from "../react_components/user_infos_card";
import EducationItems from "../react_components/education_items";

const root = createRoot(document.getElementById('root_component'));

export default function ViewerApp(){
	return(
		<>
			<div class="text-center mb-4">
				<NavGroupButton/>
			</div>
			<div>
				<UserInfosCard/>

				<EducationItems/>
			</div>
		</>
	);
};

root.render(<ViewerApp/>);