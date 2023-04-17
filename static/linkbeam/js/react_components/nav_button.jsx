import 'vite/modulepreload-polyfill';

export default function NavButton({item, active}){
	return (
		<>
			<a href="#" class={active ? "btn btn-secondary" : "btn btn-outline-light border border-secondary text-dark"} title={item.title}> 
			  	{item.content}
			  	{/*<svg data-bs-toggle="tooltip" data-bs-title="Section not public" viewBox="0 0 24 24" width="15" height="15" stroke="red" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> 
			  	<span class="badge text-bg-primary px-1">4</span>*/}
			</a>
		</>
	);
}