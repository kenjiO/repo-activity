## Overview

This package exports a function that will take a github repository as an argument and will return a promise that resolves to the date & time the last commit was made in the given repository.

## Installation
```js
npm install repo-activity
```

## Usage
```
repo-activity(repo)
```

### **Parameters**
`repo` A string with the github username and repository name separated by a /.  **Example:** `"expressjs/express"`

### **Return value**
A promise that will resolve to an ISO 8601 formatted date-time string of when the last commit in the repository was made.  If an invalid argument is passed or there is a problem fetching the data from GitHub the promise will reject with an error.


## Example
```js
var repoActivity = require('repo-activity');

repoActivity('expressjs/express').then(function(result) {
  console.log('The last commit made to the express repository was on : ' + result)
});
```
