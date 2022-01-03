let date = new Date();

let options = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

let currentDate = date.toLocaleDateString("en-US", options);

console.log(currentDate);
