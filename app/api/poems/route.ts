import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const client = new OpenAI({ apiKey: process.env.OPEN_API_KEY })

const poemsSchema = z.object({
	poems: z
		.array(
			z.object({
				title: z.string().min(1).max(100),
				author: z.string().min(1).max(100),
				text: z.string().min(40).max(500),
			})
		)
		.min(2)
		.max(2),
})

export async function GET() {
	const prompt = `Provide 2 complete poems from real authors. Alternate between English and Hindi poems, selecting from different languages/poets each time.

For English poems, choose from Victorian and Edwardian poets (1837-1920) featuring themes of courage, perseverance, nature, adventure, moral reflection, or romance:
- Rudyard Kipling
- Alfred, Lord Tennyson
- Robert Browning
- Elizabeth Barrett Browning
- Christina Rossetti
- Thomas Hardy
- William Butler Yeats
- A.E. Housman
- Robert Louis Stevenson

For Hindi poems, choose from renowned poets:
- Harivansh Rai Bachchan
- Sumitranandan Pant
- Mahadevi Varma
- Ramdhari Singh Dinkar
- Jaishankar Prasad
- Suryakant Tripathi 'Nirala'

For each poem, include:
- The complete title (in original language)
- The full poem text
- The author's name

Select poems with strong rhythmic patterns, memorable phrasing, and universal themes. Provide only authentic, published works - do not generate or modify original poems.`

	const response = await client.responses.parse({
		model: 'gpt-5-nano',
		input: [
			{ role: 'system', content: 'You are a helpful poetic assistant.' },
			{
				role: 'user',
				content: prompt,
			},
		],
		text: { format: zodTextFormat(poemsSchema as never, 'poems') },
	})
	const parsed = poemsSchema.safeParse(response.output_parsed)
	const poems = parsed.success ? parsed.data.poems : []

	console.log(parsed)

	return NextResponse.json(poems || [], { status: 200 })
}
