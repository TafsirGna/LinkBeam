export default function EducationItems({active}){
	return (
		<div className={"list-group list-group-checkable d-grid gap-2 border-0 col-6 offset-3 "+(active ? "" : "d-none")}>
		    <label class="list-group-item rounded-3 py-3 shadow" for="listGroupCheckableRadios1" >
		      First radio
		      <span class="d-block small opacity-50">With support text underneath to add more detail</span>
		    </label>
		    <label class="list-group-item rounded-3 py-3 shadow" for="listGroupCheckableRadios2">
		      Second radio
		      <span class="d-block small opacity-50">Some other text goes here</span>
		    </label>
		    <label class="list-group-item rounded-3 py-3 shadow" for="listGroupCheckableRadios3">
		      Third radio
		      <span class="d-block small opacity-50">And we end with another snippet of text</span>
		    </label>
		    <label class="list-group-item rounded-3 py-3 shadow" for="listGroupCheckableRadios4">
		      Fourth disabled radio
		      <span class="d-block small opacity-50">This option is disabled</span>
		    </label>
		</div>
	);
}