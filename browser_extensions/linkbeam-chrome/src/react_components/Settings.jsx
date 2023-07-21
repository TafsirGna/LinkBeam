import { useState } from 'react'
/*import './About.css'*/
import BackToPrev from "./widgets/BackToPrev"

function Settings(props) {
  /*const [count, setCount] = useState(0)*/

  function deleteAll(){
    confirm("Do you confirm the erase of all your data ?");
  }

  return (
    <>
      <div class="p-3">
        <BackToPrev onClick={() => props.switchOnDisplay("Activity")}/>
        <div>
          <div class="d-flex text-body-secondary pt-3">
            <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
              <div class="d-flex justify-content-between">
                <strong class="text-gray-dark">Activate notifications</strong>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked />
                  <label class="form-check-label" for="flexSwitchCheckChecked"></label>
                </div>
              </div>
              {/*<span class="d-block">@username</span>*/}
            </div>
          </div>
          <div class="d-flex text-body-secondary pt-3">
            <div class="pb-3 mb-0 small lh-sm border-bottom w-100">
              <div class="d-flex justify-content-between">
                <strong class="text-gray-dark">Erase all data</strong>
                <a href="#" class="text-danger badge" onClick={deleteAll} id="liveToastBtn">Delete</a>
              </div>
              {/*<span class="d-block">@username</span>*/}
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default Settings
