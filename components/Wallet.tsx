"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Keypair } from "@solana/web3.js";
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from "bip39";
import bs58 from "bs58";
import { derivePath } from "ed25519-hd-key";
import { useEffect, useState } from "react";
import * as nacl from "tweetnacl";
import CreateWallet from "./CreateWallet";

interface Wallet {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
}

const Wallet = () => {
  const { toast } = useToast();
  const [seed, setSeed] = useState<string>("");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [visiblePrivateKeys, setVisiblePrivateKeys] = useState<boolean[]>([]);
  const [visiblePhrases, setVisiblePhrases] = useState<boolean[]>([]);

  useEffect(() => {
    const savedWallets = localStorage.getItem("wallets");
    if (savedWallets) {
      setWallets(JSON.parse(savedWallets));
      setVisiblePrivateKeys(JSON.parse(savedWallets).map(() => false));
      setVisiblePhrases(JSON.parse(savedWallets).map(() => false));
    }
  }, []);

  const createWallet = async () => {
    const mnemonic = generateMnemonic();
    const newWallet = await generateWalletFromMnemonic(mnemonic);
    updateWallets(newWallet);
  };

  const generateWalletFromMnemonic = async (
    mnemonic: string
  ): Promise<Wallet | null> => {
    if (!validateMnemonic(mnemonic)) {
      toast({
        variant: "destructive",
        title: "Invalid recovery phrase",
        description: "Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      return null;
    }

    try {
      const seedBuffer = mnemonicToSeedSync(mnemonic);
      setSeed(seedBuffer.toString("hex"));

      const path = `m/44'/501'/0'/0'`;
      const { key: derivedSeed } = derivePath(path, seedBuffer.toString("hex"));
      const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      const keypair = Keypair.fromSecretKey(secret);

      const privateKey = bs58.encode(secret);
      const publicKey = keypair.publicKey.toBase58();

      return {
        publicKey,
        privateKey,
        mnemonic,
      };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to generate wallet",
        description: "Please try again.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
      return null;
    }
  };

  const updateWallets = (newWallet: Wallet | null) => {
    if (newWallet) {
      const updatedWallets = [...wallets, newWallet];
      setWallets(updatedWallets);
      localStorage.setItem("wallets", JSON.stringify(updatedWallets));
      setVisiblePrivateKeys([...visiblePrivateKeys, false]);
      setVisiblePhrases([...visiblePhrases, false]);
      toast({
        title: "Success",
        description: "Wallet generated successfully!",
      });
    }
  };

  const handleCreateWallet = async () => {
    await createWallet();
  };

  const handleImportWallet = async (mnemonic: string) => {
    if (mnemonic) {
      const newWallet = await generateWalletFromMnemonic(mnemonic);
      updateWallets(newWallet);
    } else {
      toast({
        variant: "destructive",
        title: "Empty mnemonic",
        description: "Please enter a valid mnemonic.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      });
    }
  };

  return (
    <div className="">
      {wallets.length === 0 ? (
        <CreateWallet
          onCreateWallet={handleCreateWallet}
          onImportWallet={handleImportWallet}
        />
      ) : (
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Your Accounts:</h3>
              {wallets.map((wallet, index) => (
                <div key={index} className="mt-2">
                  <p className="text-sm break-all">
                    Public Key: {wallet.publicKey}
                  </p>
                  <p className="flex text-sm justify-between mt-2 break-all">
                    <span>
                      Private Key:
                      {visiblePrivateKeys[index]
                        ? wallet.privateKey
                        : "  ********"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newVisiblePrivateKeys = [...visiblePrivateKeys];
                        newVisiblePrivateKeys[index] =
                          !newVisiblePrivateKeys[index];
                        setVisiblePrivateKeys(newVisiblePrivateKeys);
                      }}
                    >
                      {visiblePrivateKeys[index] ? "Hide" : "Show"}
                    </Button>
                  </p>
                  <p className="flex justify-between mt-2 text-sm break-all">
                    <span>
                      Mnemonic:
                      {visiblePhrases[index] ? wallet.mnemonic : "  ********"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newVisiblePhrases = [...visiblePhrases];
                        newVisiblePhrases[index] = !newVisiblePhrases[index];
                        setVisiblePhrases(newVisiblePhrases);
                      }}
                    >
                      {visiblePhrases[index] ? "Hide" : "Show"}
                    </Button>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Wallet;
