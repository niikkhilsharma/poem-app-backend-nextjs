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
	const prompt = `Generate 2 poems. Mostly from poets like Rudyard Kipling and similar poets. Some random poems can be included too.
Each poem must have the title, and the full text of the poem.`

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
