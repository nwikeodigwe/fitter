import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { itemSchema as schema, type Item } from "../schema/item";

const prompt = `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you do not know the value of an attribute asked to extract,
return null for the attribute's value.`;


export const extract = async (data: string, schema: Item) => {
  
  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", prompt],
    ["human", "{text}"],
  ]);

  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  const structured_llm = llm.withStructuredOutput(schema);
  const template = await promptTemplate.invoke({ data });
  return structured_llm.invoke(template);
};
