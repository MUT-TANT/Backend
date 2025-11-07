import { Request, Response } from 'express';
export declare class FaucetController {
    /**
     * Claim test tokens from faucet
     * POST /api/faucet/claim
     */
    claimTokens(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Check if user can claim from faucet
     * GET /api/faucet/can-claim/:address/:tokenAddress
     */
    canClaim(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Get token balance for a user
     * GET /api/faucet/balance/:address/:tokenAddress
     */
    getBalance(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const faucetController: FaucetController;
//# sourceMappingURL=faucet.controller.d.ts.map