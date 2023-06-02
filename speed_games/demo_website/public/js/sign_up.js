"use strict";
/**
 * Copyright 2023 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */
const e = React.createElement;

class EmailSignup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
    };
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  handleKeyUp(e) {
    var re = /\S+@\S+\.\S+/;
    this.setState({ valid: re.test(e.target.value) });
  }

  render() {
    if (this.state.liked) {
      return "You liked this.";
    }

    return React.createElement(
      "div",
      null,
      React.createElement(
        "form",
        null,
        React.createElement(
          "label",
          null,
          "Email",
            this.state.valid
              ? null
              : React.createElement("span", {style: {color:"red"}}, "*ERROR*"),
          React.createElement(
            "p",
            null,
            React.createElement("input", {
              type: "text",
              onKeyUp: this.handleKeyUp,
            })
          )
        ),
        React.createElement(
          "p",
          null,
          React.createElement("button", null, "Subscribe")
        )
      )
    );
  }
}

const domContainer = document.querySelector("#sign_up_popup");
const root = ReactDOM.createRoot(domContainer);
root.render(e(EmailSignup));
