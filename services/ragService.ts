
import { knowledgeBase, KnowledgeBaseArticle } from './knowledgeBase';

/**
 * Retrieves the most relevant document from the knowledge base based on a user query.
 * This function powers the "Retrieve" step in the RAG pipeline.
 *
 * @param query The user's input string (e.g., "precautions for diabetes").
 * @returns The content of the most relevant knowledge base article as a string, or an empty string if no match is found.
 */
export const retrieveDocuments = (query: string): string => {
  const normalizedQuery = query.toLowerCase();
  
  // Find the article where at least one of its keywords is present in the user's query.
  // This is a simple but effective keyword-based retrieval mechanism for a client-side RAG.
  const foundArticle = knowledgeBase.find(article =>
    article.keywords.some(keyword => normalizedQuery.includes(keyword))
  );

  return foundArticle ? foundArticle.content : '';
};
