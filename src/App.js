import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { WebAuth } from "auth0-js";

const BASE_URL = "https://zulfiqar.myauth0.com";
class App extends Component {
  constructor() {
    super();
    this.state = {
      coAuthed: false
    };
  }
  login() {
    fetch(`${BASE_URL}/co/authenticate`, {
      credentials: 'include',
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        username: "sam@gmail.com",
        password: "***",
        credential_type: "password",
        client_id: "8zilvPI8RKKadJ1VXHlxReacw2yEe3pS"
      })
    }).then(r => {
      if (r.status === 200) {
        r.json().then(res => {
          this.setState(...this.state, {
            coAuthed: true,
            login_ticket: res.login_ticket
          });
        });
      }
    });
  }
  authorize() {
    window.location = `${BASE_URL}/authorize?client_id=8zilvPI8RKKadJ1VXHlxReacw2yEe3pS&response_type=token&redirect_uri=http://loopback.com:3000&login_ticket=${this.state.login_ticket}`;
    // fetch(`${BASE_URL}/authorize?client_id=8zilvPI8RKKadJ1VXHlxReacw2yEe3pS&response_type=token&redirect_uri=https://1a244284.ngrok.io&login_ticket=${this.state.login_ticket}`,{
    //   credentials: 'include'
    // })
    // .then(r=>console.log(r));
  }
  render() {
    const { coAuthed } = this.state;
    if (!coAuthed) {
      return (
        <div className="App">
          <button onClick={() => this.login()}>Login</button>
        </div>
      );
    } else {
      return (
        <div className="App">
          <input type="button" value="authorize" onClick={() => this.authorize()} />
        </div>
      );
    }
  }
}

export default App;
