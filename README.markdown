#Machine.js
Make behaviour trees in JavaScript

v2.0 [PGC See changelog]
v1.1 [see changelog]

Original Code By Mary Rose Cook

* http://maryrosecook.com
* maryrosecook@maryrosecook.com

##What is Machine.js?

Machine.js lets you use a hierarchical state machine to control a JavaScript object.

This particular instantiation of behavior trees is focused on sequencing user activities that may be needed to generate a particular product.

* Background:

RESTful services are nice but users want products, not data nor services. Some products may require many steps. Service providers ought to publish goals or products that users could get and the behavior to follow to generate them as code-on-demand, running on the client (but published by the server).  This is REST Level 5.
The behavior is really a sequence of decision points and activities that will end-up executing back on the server(s).
As activities execute on behalf of users, an activity stream could easily be generated.
When the product is generated, a story can be told and propagated on the user social networks (Facebook, Twitter...).  Discovery takes off from there... but this is beyond the scope of this git.

* Define a behaviour tree as JSON.
    <pre><code>{
        identifier: "ProductX", strategy: "sequential",
        children: [
            { identifier: "find" },
            { identifier: "process" },
            { identifier: "download" },
        ]
    };
    </code></pre>

* For each leaf state, define a function that enacts the activity for that state.  So, for the process state, define a function that processes the data found in previous step.

* For each state, you can optionally define a can function that returns true if the actor may move to that state.  So, for the process state, define a function canProcess that returns true if data has been found.

##Licence

The code is open source, under the MIT licence.  
It uses:
* Base.js by Dean Edwards.
* Angular Seed and Angular.js
* Twitter Bootstrap
* Ruote Fluo Editor by John Mettraux

##Getting started

You can pick one of these options:

* serve this repository with your webserver
* install node.js and run `scripts/web-server.js`

Then navigate your browser to `http://localhost:<port>/app/index.html` to see the app running in
your browser.
Download the repository.  Open index.html in your browser to see the demo and documentation.

Running in Firefox: Toggle tools to display the web console.  You will see the code running on the client side within your browser.

### Running unit tests (Not Complete Yet)

We recommend using [jasmine](http://pivotal.github.com/jasmine/) and
[Karma](http://karma-runner.github.io) for your unit tests/specs, but you are free
to use whatever works for you.

Requires [node.js](http://nodejs.org/), Karma (`sudo npm install -g karma`) and a local
or remote browser.

* start `scripts/test.sh` (on windows: `scripts\test.bat`)
  * a browser will start and connect to the Karma server (Chrome is default browser, others can be captured by loading the same url as the one in Chrome or by changing the `config/karma.conf.js` file)
* to run or re-run tests just change any of your source or test javascript files


### End to end testing

Angular ships with a baked-in end-to-end test runner that understands angular, your app and allows
you to write your tests with jasmine-like BDD syntax.

Requires a webserver, node.js + `./scripts/web-server.js` or your backend server that hosts the angular static files.

Check out the
[end-to-end runner's documentation](http://docs.angularjs.org/guide/dev_guide.e2e-testing) for more
info.

* create your end-to-end tests in `test/e2e/scenarios.js`
* serve your project directory with your http/backend server or node.js + `scripts/web-server.js`
* to run do one of:
  * open `http://localhost:port/test/e2e/runner.html` in your browser
  * run the tests from console with [Karma](http://karma-runner.github.io) via
    `scripts/e2e-test.sh` or `script/e2e-test.bat`

### Continuous Integration

CloudBees have provided a CI/deployment setup: