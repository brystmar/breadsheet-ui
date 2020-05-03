// Global context variable for the backend URL
import React from "react";

const BackendUrlContext = React.createContext("http://breadsheet.wl.r.appspot.com");
// const BackendUrlContext = React.createContext("https://cors-anywhere.herokuapp.com/http://breadsheet.wl.r.appspot.com");

export default BackendUrlContext;
