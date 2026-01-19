import z from 'zod'
const modeSchema = z.string()
const ResponseChunkSchema = z.object({
  is_final: z.boolean(),
  mode: modeSchema,
  text: z.string(),
  wav_name: z.string(),
})
const ResponseFinalChunkSchema = z.object({
  is_final: z.literal(true),
  mode: modeSchema,
  stamp_sents: z.array(z.object({
    end: z.number(),
    punc: z.string(),
    start: z.number(),
    text_seg: z.string(),
    ts_list: z.array(z.array(z.number())),
  })),
  text: z.string(),
  timestamp: z.string(),
  wav_name: z.string(),
})
const ResponseSchema = z.union([ResponseChunkSchema, ResponseFinalChunkSchema])

export type ASRResponse = z.infer<typeof ResponseSchema>
