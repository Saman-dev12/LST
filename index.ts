import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { burnToken, mintToken, sendNativeToken } from './services';



dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/stake', async(req: Request, res: Response) => {
    try {
    const fromAddress = req.body.fromAddress;
    const amount = Number(req.body.amount);
    const result = await mintToken(fromAddress, amount);
    res.send(result);
    } catch (error) {
        console.error(error);
    }
     
});

app.post('/withdraw', async(req: Request, res: Response) => {
    try {
    const fromAddress = req.body.fromAddress;
    const amount = Number(req.body.amount);
    const burn=await burnToken(amount);
    const sent=await sendNativeToken(fromAddress, amount);
    res.send({burn,sent});
    
    } catch (error) {
       console.error(error);
    }  
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});