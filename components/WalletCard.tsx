import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, Send, Upload } from "lucide-react";
import { useState, ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface Wallet {
  publicKey: string;
  privateKey: string;
  mnemonic: string;
  derivationPath: string;
}

interface WalletCardProps {
  wallets: Wallet[];
  selectedAccount: number;
  bal: number;
  onAccountChange: (value: string) => void;
  onSend: (toAddress: string, amount: number) => void;
  onAddFunds: (isAdding: boolean, amount: number) => void;
  onWithdraw: (isWithdrawing: boolean, amount: number) => void;
  walletBalance: number;
  onCreateNewAccount: () => void;
  children: ReactNode;
}

const WalletCard: React.FC<WalletCardProps> = ({
  wallets,
  selectedAccount,
  bal,
  onAccountChange,
  onSend,
  onAddFunds,
  onWithdraw,
  walletBalance,
  onCreateNewAccount,
  children,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] =
    useState<boolean>(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [toAddress, setToAddress] = useState<string>("");

  const handleAddFunds = () => {
    onAddFunds(true, parseFloat(amount));
    setIsAddDialogOpen(false);
    setAmount("");
  };

  const handleWithdraw = () => {
    onWithdraw(false, parseFloat(amount));
    setIsWithdrawDialogOpen(false);
    setAmount("");
  };

  const handleSend = () => {
    onSend(toAddress, parseFloat(amount));
    setIsSendDialogOpen(false);
    setAmount("");
    setToAddress("");
  };

  return (
    <Card className="w-2/3">
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-6">
        <Select
          onValueChange={onAccountChange}
          value={selectedAccount.toString()}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {wallets.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                Account {index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-2xl  font-semibold">
          Balance: ${bal.toFixed(2)} ({walletBalance.toFixed(3)} SOL)
        </div>
        <div className="flex justify-between mt-4">
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button className="px-4 w-12 sm:w-36 py-2 rounded-md">
                <span className="hidden sm:inline">Send</span>
                <Send className="sm:ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Funds</DialogTitle>
              </DialogHeader>
              <Input
                type="text"
                placeholder="To Address"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleSend}>Send</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant={"outline"}
                className="bg-background w-12 sm:w-36 px-4 py-2 rounded-md"
              >
                <span className="hidden sm:inline">Add Funds</span>
                <PlusCircle className="sm:ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <WalletMultiButton />
                <DialogTitle>Add Funds</DialogTitle>
              </DialogHeader>
              <Input
                type="number"
                placeholder="Amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleAddFunds}>Add</Button>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isWithdrawDialogOpen}
            onOpenChange={setIsWithdrawDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant={"outline"}
                className="bg-background w-12 sm:w-36 px-4 py-2 rounded-md"
              >
                <span className="hidden sm:inline">Withdraw</span>
                <Upload className="sm:ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
              </DialogHeader>
              <Input
                type="number"
                placeholder="Amount in SOL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button onClick={handleWithdraw}>Withdraw</Button>
            </DialogContent>
          </Dialog>
        </div>
        {children}
        <Button onClick={onCreateNewAccount} className="mt-4">
          Create New Account
        </Button>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
