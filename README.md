# Pull request to Backlog 

This action add comment to [Backlog](https://backlog.com) issues when pull request opened or closed.

Pull request title should have issue key like `PROJECT-1`

## Inputs

### `backlog-host`

**Required** The host of your backlog workspace.

### `api-key`

**Required** The api key of your backlog account.

## Example usage

```
on:
  pull_request:
    types: [opened, closed]
jobs:
  backlog:
    runs-on: ubuntu-latest
    steps:
    - name: Add comment to Backlog issue
      uses: mongolyy/pr-to-backlog-action@v0.9
      with:
        backlog-host: workspace.backlog.com
        api-key: ${{ secrets.BACKLOG_API_KEY }}
```

