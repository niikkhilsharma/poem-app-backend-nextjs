import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import { z } from 'zod'

const client = new OpenAI({ apiKey: process.env.OPEN_API_KEY })

const quotesSchema = z.object({
	quotes: z
		.array(
			z.object({
				text: z.string().min(10).max(300),
				author: z.string().min(1).max(100),
				title: z.string().min(1).max(100),
			})
		)
		.min(2)
		.max(2),
})

export async function GET() {
	const prompt = `Provide 2 authentic quotes from real historical figures. Alternate between English and Hindi quotes, selecting from different languages/authors each time.

For English quotes, choose from philosophers, leaders, and writers (17th-20th century) featuring themes of wisdom, courage, perseverance, leadership, philosophy, or life lessons:
- Mahatma Gandhi
- Winston Churchill
- Albert Einstein
- Oscar Wilde
- Mark Twain
- Ralph Waldo Emerson
- Friedrich Nietzsche
- Bertrand Russell
- Maya Angelou

For Hindi quotes, choose from renowned Indian philosophers, writers, and leaders:
- Swami Vivekananda
- Rabindranath Tagore
- Chanakya
- Harivansh Rai Bachchan
- Atal Bihari Vajpayee
- APJ Abdul Kalam
- Premchand
- Jiddu Krishnamurti

For each quote, include:
- The complete quote text (in original language)
- The author's name
- Brief context (e.g., "On Leadership", "About Life", "On Education")

Select quotes with profound meaning, timeless wisdom, and universal appeal. Provide only authentic, verified quotes - do not generate or modify original quotes.`

	const response = await client.responses.parse({
		model: 'gpt-4o-mini',
		input: [
			{ role: 'system', content: 'You are a helpful assistant providing authentic quotes from historical figures.' },
			{
				role: 'user',
				content: prompt,
			},
		],
		text: { format: zodTextFormat(quotesSchema as never, 'quotes') },
	})

	const parsed = quotesSchema.safeParse(response.output_parsed)
	const quotes = parsed.success ? parsed.data.quotes : []

	console.log(parsed)

	return NextResponse.json(quotes || [], { status: 200 })
}
