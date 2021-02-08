const github = require('@actions/github');

function run() {
  console.log('Running JS...');
  console.log(JSON.stringify(github));
}

run();
