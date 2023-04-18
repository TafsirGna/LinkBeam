import 'vite/modulepreload-polyfill';
import NavButton from "./nav_button" 

export default function NavGroupButton({onItemPick, activeItemIndex}){

	const items = [
		{title: "User Infos", content: "User"},
		{title: "Schools and Universities", content: "Education"},
		{title: "Professional experience", content: "Jobs"},
		{title: "Licences and certifications", content: "Certifications"},
		{title: "Recent activity", content: "Activity"},
	];

	const listItems = items.map((item, index) =>
		<NavButton item={item} active={index == activeItemIndex ? true : false} onClick={() => onItemPick(index)}/>
	);

	return(
		<>
			<div class="btn-group btn-group-sm">
				{listItems}
			</div>
		</>
	);
}