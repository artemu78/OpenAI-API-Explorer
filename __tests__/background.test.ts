import { describe, it, expect } from '@jest/globals';

// Simple test for getTransactionPrice function
function getTransactionPrice(
  model: string,
  inputTokens: number,
  outputTokens: number
) {
  const modelPrice: { [key: string]: { input: number; output: number } } = {
    "gpt-4o-mini": {
      input: 0.00015,
      output: 0.0006,
    },
  };
  const inputPrice = modelPrice[model]?.input || 0;
  const outputPrice = modelPrice[model]?.output || 0;
  const promptPrice = (inputTokens / 1000) * inputPrice;
  const completionPrice = (outputTokens / 1000) * outputPrice;
  return promptPrice + completionPrice;
}

describe('getTransactionPrice', () => {
  it('should calculate the correct price for gpt-4o-mini model', () => {
    const price = getTransactionPrice('gpt-4o-mini', 1000, 500);
    // Expected: (1000/1000) * 0.00015 + (500/1000) * 0.0006 = 0.00015 + 0.0003 = 0.00045
    expect(price).toBe(0.00045);
  });
});

