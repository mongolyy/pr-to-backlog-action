import * as core from "@actions/core";
import * as github from "@actions/github";
import Webhooks from "@octokit/webhooks";
import axios from "axios";
import querystring from "querystring";

async function run() {
  try {
    const host = core.getInput("backlog-host", { required: true });
    const apiKey = core.getInput("api-key", { required: true });
    const notCloseIssue = core.getInput("not-close-issue", {required: false}) === 'true';

    if (github.context.eventName != "pull_request") {
      core.error("Event should be a pull_request");
    }
    const pr = github.context.payload as Webhooks.WebhookPayloadPullRequest;
    const title = pr.pull_request.title;

    let payload;
    switch (pr.action) {
      case "opened":
        payload = {
          statusId: 2,
          comment: `Pull request [#${pr.number}](${pr.pull_request.html_url}) created by ${pr.sender.login}: ${title}`,
        };
        break;
      case "edited":
        payload = {
          statusId: 2,
          comment: `Pull request [#${pr.number}](${pr.pull_request.html_url}) edited by ${pr.sender.login}: ${title}`,
        };
        break;
      case "closed":
        if (pr.pull_request.merged) {
          const msg = `Pull request [#${pr.number}](${pr.pull_request.html_url}) merged and closed by ${pr.sender.login}: ${title}`
          if (notCloseIssue) {
            payload = {
              comment: msg,
            };
          } else {
            payload = {
              statusId: 3,
              comment: msg,
            };
          }
        } else {
          payload = {
            comment: `Pull request [#${pr.number}](${pr.pull_request.html_url}) closed by ${pr.sender.login}: ${title}`,
          };
        }
        break;
      default:
        console.log(`Unsupported action: ${pr.action}`);
        return;
    }

    for (const issueKey of parseIssueKey(title)) {
      const apiUrl = `https://${host}/api/v2/issues/${issueKey}?apiKey=${apiKey}`;
      await axios.patch(apiUrl, querystring.stringify(payload), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function parseIssueKey(title: string): Array<string> {
  let re = /([A-Z][A-Z0-9_]+-\d+)/g;
  return title.match(re) || [];
}

run();
