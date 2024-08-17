import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const WalletDetails = ({
  wallets,
  selectedAccount,
  visiblePrivateKeys,
  visiblePhrases,
  setVisiblePrivateKeys,
  setVisiblePhrases,
}: any) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Your Wallet Address</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Your Wallet Details</DialogTitle>
      </DialogHeader>
      {wallets[selectedAccount] && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">
            Account {selectedAccount + 1}:
          </h3>
          <div className="mt-2">
            <p className="text-sm break-all">
              Public Key: {wallets[selectedAccount].publicKey}
            </p>
            <p className="flex text-sm justify-between mt-2 break-all">
              <span>
                Private Key:
                {visiblePrivateKeys[selectedAccount]
                  ? wallets[selectedAccount].privateKey
                  : "  ********"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newVisiblePrivateKeys = [...visiblePrivateKeys];
                  newVisiblePrivateKeys[selectedAccount] =
                    !newVisiblePrivateKeys[selectedAccount];
                  setVisiblePrivateKeys(newVisiblePrivateKeys);
                }}
              >
                {visiblePrivateKeys[selectedAccount] ? "Hide" : "Show"}
              </Button>
            </p>
            <p className="flex justify-between mt-2 text-sm break-all">
              <span>
                Seed Phrase:
                {visiblePhrases[selectedAccount]
                  ? wallets[selectedAccount].mnemonic
                  : "  ********"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newVisiblePhrases = [...visiblePhrases];
                  newVisiblePhrases[selectedAccount] =
                    !newVisiblePhrases[selectedAccount];
                  setVisiblePhrases(newVisiblePhrases);
                }}
              >
                {visiblePhrases[selectedAccount] ? "Hide" : "Show"}
              </Button>
            </p>
          </div>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default WalletDetails;
