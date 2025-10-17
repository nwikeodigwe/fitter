import { TavilyCrawl } from "@langchain/tavily";
import { HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an intelligent web crawler designed to extract structured, relevant, and clean product data from brand websites.
    Your job is to analyze page content, identify key entities, and return enriched metadata for listed products in a consistent format.`,
  ],
  ["placeholder", "{messages}"],
]);

const tool = new TavilyCrawl({
  maxDepth: 3,
  maxBreadth: 5,
  extractDepth: "advanced",
  format: "markdown",
  limit: 100,
  includeImages: false,
  allowExternal: false,
});

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo",
  temperature: 0.7,
});

const llmWithTools = llm.bindTools([tool]);

const chain = prompt.pipe(llmWithTools);

const toolChain = RunnableLambda.from(async (userInput: string, config) => {
  const retries = 3;
  for (let i = 0; i < retries; i++) {
    try {
      const humanMessage = new HumanMessage(userInput);

      const aiMsg = await chain.invoke(
        {
          messages: [new HumanMessage(userInput)],
        },
        config
      );

      if (!aiMsg.tool_calls || aiMsg.tool_calls.length === 0) {
        console.error(aiMsg);
        return;
      }

      const toolMsgs = await tool.batch(aiMsg.tool_calls, config);

      return chain.invoke(
        {
          messages: [humanMessage, aiMsg, ...toolMsgs],
        },
        config
      );
    } catch (err) {
      await sleep(1000 * (i + 1));
      console.error(err);
    }
  }
});

export const crawl = async (urls: string[]) => {
  const result = await Promise.all(urls.map((url) => toolChain.invoke(url)));
  return result;
};
