import type { NextApiRequest, NextApiResponse } from 'next';
import { MCPClient } from '@fastgpt/service/core/app/mcp';
import { getSecretValue } from '@fastgpt/service/common/secret/utils';
import { type StoreSecretValueType } from '@fastgpt/global/common/secret/type';

export type getMCPToolsBody = { url: string; headerSecret: StoreSecretValueType };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url, headerSecret } = req.body as getMCPToolsBody;

    const mcpClient = new MCPClient({
      url,
      headers: getSecretValue({
        storeSecret: headerSecret
      })
    });

    const result = await mcpClient.getTools();
    res.status(200).json({ code: 200, data: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message, code: 500 });
  }
}
