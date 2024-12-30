import {
    
    createBurnCheckedInstruction,
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
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
        return mint;
        
    } catch (error) {
        console.error("Error finding ATA:", error);
    }
};


export const burnToken = async (amount: number) => {
    try {
        const privateKey = bs58.decode(process.env.PRIVATE_KEY as string);
        const payer = Keypair.fromSecretKey(privateKey);
        const mintAddress = new PublicKey(process.env.TOKEN_MINT_ADDRESS!);
        const ata = await getAssociatedTokenAddress(
          mintAddress,payer.publicKey,false,TOKEN_2022_PROGRAM_ID
        );
        console.log("ATA:",ata.toString());
        const txn = new Transaction().add(
            createBurnCheckedInstruction(
                ata,
                mintAddress,
                payer.publicKey,
                amount,
                9,
                [],
                TOKEN_2022_PROGRAM_ID
            )
        )
        const burn = await sendAndConfirmTransaction(connection,txn,[payer],{skipPreflight:true});
        console.log("Burned:",amount,"LST from",payer.publicKey.toString());
        console.log("Transaction Signature:",burn);
    }
    catch (error) {
        console.error("Error burning token:", error);
    }
};

export const sendNativeToken = async (fromAddress: string,amount: number) => {
    try {
        const privateKey = bs58.decode(process.env.PRIVATE_KEY as string);
        const payer = Keypair.fromSecretKey(privateKey);
        const recipient = new PublicKey(fromAddress);
        const txn = new Transaction(
        ).add(
            SystemProgram.transfer({
                fromPubkey: payer.publicKey,
                toPubkey: recipient,
                lamports: amount,
            }) 
        );
        txn.feePayer= payer.publicKey;
        txn.recentBlockhash=(await connection.getLatestBlockhash()).blockhash;
                
        const sent = await sendAndConfirmTransaction(connection,txn,[payer],{skipPreflight:true});
        console.log("Sent:",amount,"Native sol to",fromAddress);
        console.log("Transaction Signature:",sent);
        return sent;
    }
        
    catch (error) {
        console.error("Error burning token:", error);
    }
};
