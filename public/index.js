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

var options = {
  chart: {
    type: "bar",
  },
  series: [
    {
      name: "sales",
      data: [30, 40, 45, 50, 49, 60, 70, 91, 125],
    },
  ],
  xaxis: {
    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
  },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);

chart.render();
