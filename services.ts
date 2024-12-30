import {
    getMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();
const LST_RATE = 960000000; 

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export const mintToken = async (fromAddress: string,amount: number) => {
    try {
        const privateKey = bs58.decode(process.env.PRIVATE_KEY as string);
        const payer = Keypair.fromSecretKey(privateKey);
        
        const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);

        const recipient = new PublicKey(fromAddress);
        
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            mintAddress,
            recipient,
            true,
            "confirmed",
            undefined,
            TOKEN_2022_PROGRAM_ID
        );
        const amt = LST_RATE*(amount/LAMPORTS_PER_SOL);  
        const mint = await mintTo(connection,payer,mintAddress,ata.address,payer,amt,[],undefined,TOKEN_2022_PROGRAM_ID);
        console.log("Minted:",amt,"LST to",fromAddress);
        console.log("Transaction Signature:",mint);
        
    } catch (error) {
        console.error("Error finding ATA:", error);
    }
};


