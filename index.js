const github = require('@actions/github');
const fetch = require('node-fetch');

async function run() {
  const pullRequest = github.context.payload.pull_request;
  const PRBody = pullRequest.body;
  const PRHref = pullRequest.html_url;
  const urlRegex = /(https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
  const urls = PRBody.match(urlRegex) ?? [];
  const notionUrl = urls.find((url) => url.match('notion.so'));

  let status;
  switch (github.context.payload.action) {
    case 'opened':
    case 'review_request_removed':
      status = 'in-progress';
      break;
    case 'ready_for_review':
    case 'review_requested':
      status = 'fixready';
      break;
    case 'closed':
      status = 'done';
      break;
    default:
      status = undefined;
  }

  if (notionUrl) {
    const urlParts = notionUrl.split('/');
    const taskName = urlParts[urlParts.length - 1];
    const taskParts = taskName.split('-');
    const pageId = taskParts[taskParts.length - 1];

    try {
      const result = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NOTION_BOT_SECRET_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            ...(status ? { Status: { name: status } } : null),
            'GitHub URL': [{ type: 'text', text: { content: PRHref } }],
          },
        }),
      });
      console.log('Notion task updated!');
    } catch (error) {
      console.log('Failed to update Notion task.');
      console.error(error);
    }
  } else {
    console.log('No notion task found in the PR body.');
  }
}

run();
