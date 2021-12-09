// ####### Profile ########## //
let toggleMenu = document.querySelector(".user-input");

let addBtn = document.querySelector(".add-new");
addBtn.addEventListener("click", function () {
  toggleMenu.classList.add("user-input-active");
  closeForm.classList.add("close-form-active");
});

let closeForm = document.querySelector(".close-form");
closeForm.addEventListener("click", function () {
  toggleMenu.classList.remove("user-input-active");
  closeForm.classList.remove("close-form-active");
});

let empForm = document.getElementById("empform");
function resetForm() {
  empForm.rest();
}

// ###################### PayRoll Js #####################

function closePayrollForm() {
  let overlayCover = document.querySelector(".overlay");
  let payslipForm = document.querySelector(".payroll-form-content");

  overlayCover.classList.remove("add-overlay");
  payslipForm.classList.remove("add-form");
}

// ############### PaySlip Js #######################

function closePayslipForm() {
  let overlayCover = document.querySelector(".overlay");
  let payslipForm = document.querySelector(".payslip-form-content");

  overlayCover.classList.remove("add-overlay");
  payslipForm.classList.remove("add-form");
}
