import 'vite/modulepreload-polyfill';
import NavButton from "./nav_button" 

/*export default function NavGroupButton({onItemPick, activeItemIndex}){*/
export default function NavGroupButton(props){

	const items = [
		{title: "User Infos", content: "User"},
		{title: "Schools and Universities", content: "Education"},
		{title: "Professional experience", content: "Jobs"},
		{title: "Licences and certifications", content: "Certifications"},
		{title: "Recent activity", content: "Activity"},
	];

	const listItems = items.map((item, index) =>
		<NavButton item={item} active={index == props.activeItemIndex ? true : false} onClick={() => props.onItemPick(index)}/>
	);

	return(
		<>
			<div class="btn-group btn-group-sm">
				{listItems}
			</div>
		</>
	);
}