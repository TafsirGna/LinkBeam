import 'vite/modulepreload-polyfill';
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import NavGroupButton from "../react_components/nav_group_button";
import UserInfosCard from "../react_components/user_infos_card";
import EducationItems from "../react_components/education_items";

const root = createRoot(document.getElementById('root_component'));

export default function ViewerApp(){

	const [activeItemIndex, setActiveItemIndex] = useState(0);

	const onItemPick = (itemIndex) => {
		setActiveItemIndex(parseInt(itemIndex));
	};

	return(
		<>
			<div className="text-center mb-4">
				<NavGroupButton onItemPick={onItemPick} activeItemIndex={activeItemIndex}/>
			</div>
			<div>
				<UserInfosCard active={activeItemIndex == 0}/>

				<EducationItems active={activeItemIndex == 1}/>
			</div>
		</>
	);
};

root.render(<ViewerApp/>);