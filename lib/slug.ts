import prisma from './prisma'

export async function generateSlug(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  let slug = base
  let count = 1
  while (await prisma.company.findUnique({ where: { slug } })) {
    slug = `${base}-${count++}`
  }
  return slug
}
