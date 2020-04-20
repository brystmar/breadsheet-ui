// Make the NavBar sticky
// Trigger the sticky function when the user scrolls
window.onscroll = () => makeNavBarSticky();

// Get the navbar & offset position of the navbar
let navbar = document.getElementById("header")
let sticky = navbar.offsetTop;

// Apply .sticky class to the navbar when its scroll position is reached
// Remove when leaving the scroll position
function makeNavBarSticky() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}
