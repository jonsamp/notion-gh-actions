const github = require('@actions/github');
const fetch = require('node-fetch');

async function run() {
  const pullRequest = github.context.payload.pull_request;
  const PRBody = pullRequest.body;
  const PRHref = pullRequest.html_url;
  const urlRegex = /(https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g;
  const urls = PRBody.match(urlRegex) ?? [];
  const notionUrl = urls.find((url) => url.match('notion.so'));

  if (notionUrl) {
    const urlParts = notionUrl.split('/');
    const taskName = urlParts[urlParts.length - 1];
    const taskParts = taskName.split('-');
    const pageId = taskParts[taskParts.length - 1];
    console.log(pageId);
    console.log(PRHref);

    try {
      console.log('MAKING A REQUEST');
      const result = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NOTION_BOT_SECRET_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            Status: { name: 'fixready' },
            'GitHub URL': [{ type: 'text', text: { content: `"${PRHref}"` } }],
          },
        }),
      });
      console.log('REQUEST COMPLETE', JSON.stringify(result));
    } catch (error) {
      console.error(error);
    }
  }
}

run();
