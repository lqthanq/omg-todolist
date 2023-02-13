import logo from "./logo.svg";
import "./App.css";
import React from "react";

function App() {
  React.useEffect(() => {
    (async function () {
      // const data = await fetch("https://omg-todolist.onrender.com/users");
      fetch("http://localhost:8080/users")
        .then((res) => res.json())
        .then((res) => {
          console.log("res:", res);
        });
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
