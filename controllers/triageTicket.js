const zendeskClient = require('./utils/zendeskClient')
// const matchGroupNameToId = require('./utils/matchGroupNameToId')

async function triageTicket (ticketId, ticketProperties) {
  const client = zendeskClient()

  const { summary, priority, category, tags } = ticketProperties
  // const groupId = await matchGroupNameToId(assignee)

  const ticketData = {
    ticket: {
      comment: {
        body: summary,
        public: false
      },
      priority,
      // group_id: groupId,
      tags,
      custom_fields: [
        {
          id: 11002089412493,
          value: category
        }
      ]
    }
  }

  try {
    await client.tickets.update(ticketId, ticketData)
  } catch (err) {
    console.log(ticketId, ticketProperties)
    throw new Error(err)
  }
}

module.exports = triageTicket
