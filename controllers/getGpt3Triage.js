const { openAiClient, completionOptions } = require('./utils/openAIClient')

function parseGpt3Response (choices) {
  try {
    let result = choices[0].text

    // Remove newlines that GPT-3 inserts
    result = result.replace(/(\r\n|\r|\n)/g, '')
    if (result[0] !== '{') {
      const startIndex = result.indexOf('{')
      result = result.substring(startIndex, result.length)
    }
    const resultJSON = JSON.parse(result)

    // GPT-3 sometimes returns "Normal or Priority" when Zendesk
    // expects to receive lowercase.
    resultJSON.priority = resultJSON.priority.toLowerCase()

    return resultJSON
  } catch (err) {
    // TODO: Error handle this - put in separate queue.
    console.log('Failed to parse GPT-3 response')
    throw new Error(err)
  }
}

async function getGpt3Triage (chatText) {
  console.log(`customer request: ${chatText}`)
  const openai = openAiClient()

  const prompt = `The following is a support ticket from a customer, reply only with a JSON-formatted object like this:
    { "summary": "a summary of the ticket conversation", 
    "sentiment": "The sentiment the user is feeling narrowed to 1 or 2 words.",
    "priority": "low, normal, high, or urgent.",
    "category": "feature request, subscription question, view game, find team, messaging, or other.", 
    "tags": ["come up with between 1 and 3 tags for the problem in 2 underscore-separated words"] }
    ${chatText}`

  try {
    const completion = await openai.createCompletion(completionOptions(prompt))

    console.log(`before parsing response: ${JSON.stringify(completion.data.choices)}`)
    const response = parseGpt3Response(completion.data.choices)
    console.log(`chatGPT response: ${JSON.stringify(response)}`)
    return response
  } catch (error) {
    console.log(error.response)
    throw new Error(error.response)
  }
}

module.exports = getGpt3Triage
