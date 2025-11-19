// /server/api/worlds/quest.get.ts
import { loadQuestFile } from '../../utils/loadQuestFile'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const world = query.world as string
  const node = Number(query.node)

  if (!world || isNaN(node)) {
    throw createError({
      statusCode: 400,
      message: 'Missing or invalid world/node'
    })
  }

  let dataset: any[]
  try {
    dataset = loadQuestFile(world)
  } catch (err: any) {
    throw createError({
      statusCode: 400,
      message: err?.message || 'Quest file error'
    })
  }

  const quest = dataset.find((q: any) => q.node === node)

  if (!quest) {
    throw createError({
      statusCode: 404,
      message: 'Quest not found'
    })
  }

  return quest
})
