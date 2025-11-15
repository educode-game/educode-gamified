import cpp from '../../data/cpp_quests.json'
import java from '../../data/java_quests.json'
import python from '../../data/python_quests.json'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const world = query.world as string
  const node = Number(query.node)

  const db: Record<string, any[]> = {
    cpp,
    java,
    python
  }

  if (!db[world]) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid world'
    })
  }

  const quest = db[world].find(q => q.node === node)

  if (!quest) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Quest not found'
    })
  }

  return quest
})
