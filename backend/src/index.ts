import express, { Request, Response, NextFunction } from 'express';
import { AgentRuntime, LocalSigner, createAptosTools } from 'move-agent-kit';
import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants, Account} from '@aptos-labs/ts-sdk';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();


const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const aptosConfig = new AptosConfig({
  network: Network.TESTNET,
});

const aptos = new Aptos(aptosConfig);

const llm = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

let agentRuntime: AgentRuntime;
let agentAddress: string;
let agentTools: any;

const initializeAgent = async (): Promise<boolean> => {
  try {
    const privateKeyStr = process.env.APTOS_PRIVATE_KEY;
if (!privateKeyStr) {
  throw new Error("Missing APTOS_PRIVATE_KEY environment variable");
}

// Remove "0x" prefix if present
const cleanedPrivateKeyStr = privateKeyStr.startsWith("0x") ? privateKeyStr.substring(2) : privateKeyStr;

// Format the private key according to AIP-80
const formattedPrivateKey = PrivateKey.formatPrivateKey(cleanedPrivateKeyStr, PrivateKeyVariants.Ed25519);

// Create the private key instance with the formatted key
const privateKey = new Ed25519PrivateKey(formattedPrivateKey);

const account = Account.fromPrivateKey({
  privateKey,
});
    agentAddress = account.accountAddress.toString();
    console.log(`Agent address: ${agentAddress}`);

    const signer = new LocalSigner(account, Network.TESTNET);
    agentRuntime = new AgentRuntime(signer, aptos, {
      PANORA_API_KEY: process.env.PANORA_API_KEY,
    });

    agentTools = createAptosTools(agentRuntime, {
      filter: [
        "aptos_balance",
        "aptos_get_wallet_address",
        "aptos_transfer_token",
      ],
    });

    console.log(`Agent initialized with address: ${agentAddress}`);
    return true;
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    return false;
  }
};


initializeAgent().then((success) => {
  if (success) {
    console.log("Agent successfully initialized");
  } else {
    console.error("Failed to initialize agent");
  }
});

const getAgentBalance = async (): Promise<number> => {
  try {
    if (!agentRuntime) {
      throw new Error("Agent not initialized");
    }
    
    console.log("Agent runtime in GetBalance", agentAddress);
    
    // Use the Aptos SDK directly instead of agentRuntime.getBalance
    const balanceData = await aptos.getAccountAPTAmount({
      accountAddress: agentAddress,
    });

    return Number(balanceData) / 100000000;
  } catch (error) {
    console.error("Error getting balance:", error);
    // Return 0 instead of throwing
    return 0;
  }
};


interface GameInfo {
  pot: number;
  round: string;
  communityCards: any[];
  aiCards: any[];
  aiChips: number;
  playerChips: number;
  actions: any[];
}

interface Decision {
  action: string;
  amount?: number;
  confidence: number;
  reasoning: string;
}

const makePokerDecision = async (gameInfo: GameInfo): Promise<Decision> => {
  try {
    const { pot, round, communityCards, aiCards, aiChips, playerChips, actions } = gameInfo;
    
    const prompt = `
      You are an expert poker AI agent. Analyze the current game state and make a strategic decision.
      
      Game state:
      - Round: ${round}
      - Pot: ${pot} chips
      - Community cards: ${JSON.stringify(communityCards)}
      - Your cards: ${JSON.stringify(aiCards)}
      - Your chips: ${aiChips}
      - Opponent chips: ${playerChips}
      - Recent actions: ${JSON.stringify(actions.slice(-3))}
      
      Provide your decision as one of: fold, check, call, raise, or all-in.
      If raising, specify the amount.
      Include your confidence level (0.0-1.0) and brief reasoning.
      
      Format your response as a JSON object with keys: action, amount (if applicable), confidence, reasoning.
    `;
    
    const response = await llm.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        { role: "user", content: prompt }
      ],
    });
    
    const responseText = response.choices[0].message.content;
    
    if (responseText) {
      const jsonMatch = responseText.match(/{[\s\S]*?}/);
      
      let decision;
      if (jsonMatch) {
        try {
          decision = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse AI response:", e);
          throw new Error("Invalid AI response format");
        }
      } else {
        throw new Error("Could not extract decision from AI response");
      }
      
      return {
        action: decision.action,
        amount: decision.amount,
        confidence: decision.confidence,
        reasoning: decision.reasoning
      };
    } else {
      console.error("Response text is null");
      throw new Error("Failed to get AI response");
    }
  } catch (error) {
    console.error("Error making poker decision:", error);
    throw error;
  }
};

app.get('/', (req: Request, res: Response) => {
  res.send('Poker Challenge Backend is running!');
});

app.post('/api/agent/connect', async (req: Request, res: Response) => {
  try {
    if (!agentRuntime || !agentAddress) {
      const success = await initializeAgent();
      if (!success) {
        throw new Error("Failed to initialize agent");
      }
    }
    
    const balance = await getAgentBalance();
    
    res.json({
      address: agentAddress,
      balance: balance
    });
  } catch (error: any) {
    console.error("Error connecting agent:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agent/balance', async (req: Request, res: Response) => {
  try {
    if (!agentRuntime || !agentAddress) {
      throw new Error("Agent not initialized");
    }
    
    const balance = await getAgentBalance();
    
    res.json({
      balance: balance
    });
  } catch (error: any) {
    console.error("Error getting balance:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/agent/decision', async (req: Request, res: Response) => {
  try {
    const gameInfo = req.body as GameInfo;
    
    if (!gameInfo || !gameInfo.round || !gameInfo.communityCards) {
      throw new Error("Invalid game information");
    }
    
    const decision = await makePokerDecision(gameInfo);
    
    res.json(decision);
  } catch (error: any) {
    console.error("Error getting AI decision:", error);
    res.status(500).json({ error: error.message });
  }
});

interface TransactionRequest {
  amount: number;
  reason: string;
}

app.post('/api/agent/transaction', async (req: Request, res: Response) => {
  try {
    const { amount, reason } = req.body as TransactionRequest;
    
    if (!agentRuntime) {
      throw new Error("Agent not initialized");
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      throw new Error("Invalid transaction amount");
    }
    
    console.log(`Transaction requested: ${amount} APT, Reason: ${reason}`);
    
    const success = true;
    
    res.json({
      success: success,
      transactionHash: "simulated_hash_" + Date.now()
    });
  } catch (error: any) {
    console.error("Error performing transaction:", error);
    res.status(500).json({ error: error.message, success: false });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: err.message || 'Something went wrong!',
    success: false
  });
});
