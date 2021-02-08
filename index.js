import github from '@actions/github';

function run() {
  console.log('Running JS...');
  console.log(JSON.stringify(github));
}

run();
