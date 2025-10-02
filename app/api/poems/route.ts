import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const client = new OpenAI({ apiKey: process.env.OPEN_API_KEY })

const poemsSchema = z.object({
	poems: z.array(
		z.object({
			title: z.string().min(1).max(100),
			author: z.string().min(1).max(100),
			text: z.string().min(50).max(1000),
		})
	),
})

export async function GET() {
	const prompt = `Generate 2 poems in the style of classic Victorian and Edwardian poetry. Focus on themes of courage, perseverance, nature, adventure, and moral reflection. Each poem should feature:
- Strong rhythmic patterns and clear meter
- Accessible language with memorable phrasing
- Narrative or philosophical elements
- Universal themes that resonate across time

Include the complete title and full text for each poem. Aim for works that balance traditional structure with timeless wisdom, similar to the great narrative and didactic poets of the late 19th and early 20th centuries.
`

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
