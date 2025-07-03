const axios = require('axios');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');

dotenv.config();

// Don't instantiate clients immediately - do it lazily when needed
let openai = null;
let anthropic = null;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    console.log('Initializing OpenAI client');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

function getAnthropicClient() {
  if (!anthropic && process.env.ANTHROPIC_API_KEY) {
    console.log('Initializing Anthropic client');
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

async function sendRequestToOpenAI(model, message) {
  const client = getOpenAIClient();
  if (!client) {
    console.error('OpenAI client not available - API key not configured');
    throw new Error('OpenAI API key not configured');
  }

  console.log(`Sending request to OpenAI with model: ${model}`);
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`OpenAI request attempt ${i + 1}/${MAX_RETRIES}`);
      const response = await client.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      console.log(`OpenAI response received successfully on attempt ${i + 1}`);
      console.log(`OpenAI response length: ${response.choices[0].message.content.length} characters`);
      return response.choices[0].message.content;
    } catch (error) {
      console.error(`Error sending request to OpenAI (attempt ${i + 1}):`, error.message);
      if (error.response) {
        console.error(`OpenAI API error status: ${error.response.status}`);
        console.error(`OpenAI API error data:`, error.response.data);
      }
      if (i === MAX_RETRIES - 1) throw error;
      console.log(`Retrying OpenAI request in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendRequestToAnthropic(model, message) {
  const client = getAnthropicClient();
  if (!client) {
    console.error('Anthropic client not available - API key not configured');
    throw new Error('Anthropic API key not configured');
  }

  console.log(`Sending request to Anthropic with model: ${model}`);

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`Anthropic request attempt ${i + 1}/${MAX_RETRIES}`);
      const response = await client.messages.create({
        model: model,
        messages: [{ role: 'user', content: message }],
        max_tokens: 1024,
      });
      console.log(`Anthropic response received successfully on attempt ${i + 1}`);
      console.log(`Anthropic response content:`, JSON.stringify(response.content));
      return response.content[0].text;
    } catch (error) {
      console.error(`Error sending request to Anthropic (attempt ${i + 1}):`, error.message);
      if (error.response) {
        console.error(`Anthropic API error status: ${error.response.status}`);
        console.error(`Anthropic API error data:`, error.response.data);
      }
      if (i === MAX_RETRIES - 1) throw error;
      console.log(`Retrying Anthropic request in ${RETRY_DELAY}ms...`);
      await sleep(RETRY_DELAY);
    }
  }
}

async function sendLLMRequest(provider, model, message) {
  console.log(`LLM request initiated - Provider: ${provider}, Model: ${model}`);
  
  switch (provider.toLowerCase()) {
    case 'openai':
      return sendRequestToOpenAI(model, message);
    case 'anthropic':
      return sendRequestToAnthropic(model, message);
    default:
      console.error(`Unsupported LLM provider: ${provider}`);
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

module.exports = {
  sendLLMRequest
};