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

/*import './IncompleteSectionMessageView.css'*/

export default function IncompleteSectionMessageView(props){
  return <div class="small shadow-sm mb-3 mt-2 p-1 mx-3 fst-italic border-start border-warning ps-2 border-4 bg-warning-subtle text-muted">
          It seems like the {props.sectionName} section is incomplete. Revisit the 
          <a class="mx-1" href={`https://${props.profile.url}details/${props.sectionName}`} target="_blank">
            profile
          </a>
          to enrich this section.
        </div>
}