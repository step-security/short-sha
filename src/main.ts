import * as core from '@actions/core'
import {context} from '@actions/github'
import {shorten} from './shorten'
import axios, {isAxiosError} from 'axios'

async function validateSubscription(): Promise<void> {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`

  try {
    await axios.get(API_URL, {timeout: 3000})
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(
        'Subscription is not valid. Reach out to support@stepsecurity.io'
      )
      process.exit(1)
    } else {
      core.info('Timeout or API not reachable. Continuing to next step.')
    }
  }
}

async function run(): Promise<void> {
  try {
    await validateSubscription()
    const sha = context.sha
    core.debug(`Sha:    ${sha}`)
    const length = Number(core.getInput('length'))
    core.debug(`Length: ${length}`)
    const shortSha = shorten(sha, length)
    core.debug(`Output: ${shortSha}`)

    core.setOutput('sha', shortSha)
    core.exportVariable(core.getInput('variable_name'), shortSha)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
