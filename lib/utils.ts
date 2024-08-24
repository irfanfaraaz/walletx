import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createMint,
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} from "@solana/spl-token";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export async function getSolBalanaceInUSD(publicKey: string): Promise<number> {
  let wallet = new PublicKey(publicKey);
  const userSol = (await connection.getBalance(wallet)) / LAMPORTS_PER_SOL;

  const response = await fetch("https://price.jup.ag/v6/price?ids=SOL", {
    method: "GET",
  });

  const data = await response.json();

  const currentPrice = data.data?.SOL?.price ?? 0;

  const userBal = userSol * currentPrice;

  return userBal;
}

export async function addFunds(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  amount: number,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection
  ) => Promise<string>
): Promise<string> {
  const transaction = new Transaction();
  const instruction = SystemProgram.transfer({
    fromPubkey: fromPublicKey,
    lamports: amount * LAMPORTS_PER_SOL,
    toPubkey: toPublicKey,
  });

  transaction.add(instruction);

  try {
    const signature = await sendTransaction(transaction, connection);
    return signature;
  } catch (error) {
    console.error("Transaction Error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function withdrawFunds(
  fromPrivateKey: string,
  toPublicKey: PublicKey,
  amount: number
): Promise<string> {
  const fromKeypair = Keypair.fromSecretKey(
    Uint8Array.from(fromPrivateKey.split(",").map(Number))
  );
  const transaction = new Transaction();
  const instruction = SystemProgram.transfer({
    fromPubkey: fromKeypair.publicKey,
    lamports: amount * LAMPORTS_PER_SOL,
    toPubkey: toPublicKey,
  });

  transaction.add(instruction);

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromKeypair,
    ]);
    return signature;
  } catch (error) {
    console.error("heheheh");
    console.error("Transaction Error:", error);

    throw new Error("Transaction failed!");
  }
}

export async function sendFunds(
  fromPrivateKey: string,
  toPublicKey: string,
  amount: number,
  mintAddress?: string // Optional parameter to specify SPL token mint
): Promise<string> {
  const fromKeypair = Keypair.fromSecretKey(
    Uint8Array.from(fromPrivateKey.split(",").map(Number))
  );

  const toPublicKeyObj = new PublicKey(toPublicKey);
  const transaction = new Transaction();

  if (mintAddress) {
    // If mintAddress is provided, send SPL token
    const mintPublicKey = new PublicKey(mintAddress);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintPublicKey,
      fromKeypair.publicKey,
      undefined,
      undefined,
      undefined,
      new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
    );

    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      fromKeypair,
      mintPublicKey,
      toPublicKeyObj
    );

    const transferInstruction = createTransferInstruction(
      fromTokenAccount.address,
      toTokenAccount.address,
      fromKeypair.publicKey,
      amount,
      [],
      new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
    );

    transaction.add(transferInstruction);
  } else {
    // If no mintAddress is provided, send SOL
    const instruction = SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      lamports: amount * LAMPORTS_PER_SOL,
      toPubkey: toPublicKeyObj,
    });

    transaction.add(instruction);
  }

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      fromKeypair,
    ]);
    return signature;
  } catch (error) {
    console.error("Transaction Error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}

export async function fetchTokens(publicKey: string) {
  const wallet = new PublicKey(publicKey);
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
    programId: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),
  });
  const tokens = await Promise.all(
    tokenAccounts.value.map(async (accountInfo) => {
      const accountData = accountInfo.account.data.parsed.info;
      const mintAddress = new PublicKey(accountData.mint);

      const mintInfo = await connection.getParsedAccountInfo(mintAddress);
      const data = mintInfo.value?.data;

      let name = null;
      let symbol = null;

      if (data && typeof data === "object" && "parsed" in data) {
        const info = data.parsed?.info?.extensions?.[1]?.state || null;
        if (info) {
          name = info.name ?? null;
          symbol = info.symbol ?? null;
        }
        // console.log(name, symbol);
      }

      return {
        mint: accountData.mint,
        amount: accountData.tokenAmount.uiAmount,
        decimals: accountData.tokenAmount.decimals,
        name: name,
        symbol: symbol,
      };
    })
  );

  return tokens;
}

export async function createToken(
  connection: Connection,
  fromPrivateKey: string,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null,
  decimals: number = 9,
  mintAmount: number = 100000000000
): Promise<PublicKey> {
  // Create a new mint
  const fromKeypair = Keypair.fromSecretKey(
    Uint8Array.from(fromPrivateKey.split(",").map(Number))
  );
  const mint = await createMint(
    connection,
    fromKeypair,
    mintAuthority,
    freezeAuthority,
    decimals,
    undefined,
    undefined,
    new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
  );

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromKeypair,
    mint,
    fromKeypair.publicKey,
    undefined,
    undefined,
    undefined,
    new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
  );

  await mintTo(
    connection,
    fromKeypair,
    mint,
    tokenAccount.address,
    mintAuthority,
    mintAmount * 10 ** decimals,
    undefined,
    undefined,
    new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
  );

  console.log("Token Created:", mint.toBase58());
  return mint;
}
